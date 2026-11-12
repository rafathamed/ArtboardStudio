const ADMIN_EMAIL = "rafathamed9@gmail.com";
const MAX_DAYS = 30;
const DEFAULT_DAYS = 30;
const MAX_RECENT = 120;
const BOT_RE = /bot|crawler|spider|slurp|facebookexternalhit|preview|headlesschrome|uptimerobot/i;

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = origin === env.SITE_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "null",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff"
    }, headers || {})
  });
}

function validOrigin(request, env) {
  return request.headers.get("Origin") === env.SITE_ORIGIN;
}

function clampDays(value) {
  const n = Number.parseInt(value || String(DEFAULT_DAYS), 10);
  return Number.isFinite(n) ? Math.max(1, Math.min(MAX_DAYS, n)) : DEFAULT_DAYS;
}

function cleanText(value, max) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max);
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function visitorHash(visitorId, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(visitorId));
  return toHex(signature);
}

async function authenticateAdmin(request, env) {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match || !env.FIREBASE_API_KEY) return false;

  // Identity Toolkit validates the Firebase ID token signature, issuer, expiry and audience.
  const response = await fetch(
    "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + encodeURIComponent(env.FIREBASE_API_KEY),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: match[1] })
    }
  );
  if (!response.ok) return false;
  const data = await response.json();
  const user = data && data.users && data.users[0];
  return !!(
    user &&
    String(user.email || "").toLowerCase() === ADMIN_EMAIL &&
    user.emailVerified === true
  );
}

async function trackEvent(request, env) {
  if (!validOrigin(request, env)) return json({ ok: false, error: "origin_not_allowed" }, 403);

  const ip = cleanText(request.headers.get("CF-Connecting-IP") || "", 64);
  if (!ip) return json({ ok: false, error: "ip_unavailable" }, 400);

  const userAgent = cleanText(request.headers.get("User-Agent") || "", 300);
  if (BOT_RE.test(userAgent)) return json({ ok: true, ignored: true }, 200);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const eventType = body && body.type;
  if (eventType !== "visit" && eventType !== "download") {
    return json({ ok: false, error: "invalid_event_type" }, 400);
  }

  const visitorId = cleanText(body.visitorId || "", 100);
  if (!/^[a-zA-Z0-9_-]{16,100}$/.test(visitorId)) {
    return json({ ok: false, error: "invalid_visitor_id" }, 400);
  }

  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS total FROM analytics_events WHERE ip_address = ? AND datetime(created_at) >= datetime('now', '-5 minutes')"
  ).bind(ip).first();
  if (recent && recent.total >= 100) return json({ ok: false, error: "rate_limited" }, 429);

  const cf = request.cf || {};
  const city = cleanText(cf.city || "", 100);
  const region = cleanText(cf.region || cf.regionCode || "", 100);
  const country = cleanText(cf.country || "", 4);
  const latitude = Number.isFinite(Number(cf.latitude)) ? Number(cf.latitude) : null;
  const longitude = Number.isFinite(Number(cf.longitude)) ? Number(cf.longitude) : null;
  const referrer = cleanText(body.referrer || "", 500);
  const pagePath = cleanText(body.path || "/", 500);
  const visitorKey = await visitorHash(visitorId, env.VISITOR_HASH_SECRET);

  await env.DB.prepare(
    "INSERT INTO analytics_events (visitor_key, event_type, page_path, ip_address, city, region, country, latitude, longitude, referrer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(visitorKey, eventType, pagePath, ip, city, region, country, latitude, longitude, referrer).run();

  // Keep visitor-level data for 30 days. The cleanup runs during tracking requests.
  await env.DB.prepare(
    "DELETE FROM analytics_events WHERE datetime(created_at) < datetime('now', '-30 days')"
  ).run();

  return json({ ok: true }, 202);
}

async function adminSummary(request, env) {
  if (!validOrigin(request, env)) return json({ ok: false, error: "origin_not_allowed" }, 403);
  if (!(await authenticateAdmin(request, env))) return json({ ok: false, error: "unauthorized" }, 401);

  // Enforce the 30-day retention window whenever the dashboard is opened.
  await env.DB.prepare("DELETE FROM analytics_events WHERE datetime(created_at) < datetime('now', '-30 days')").run();

  const url = new URL(request.url);
  const days = clampDays(url.searchParams.get("days"));
  const modifier = "-" + days + " days";

  const summary = await env.DB.prepare(`
    SELECT
      SUM(CASE WHEN event_type = 'visit' THEN 1 ELSE 0 END) AS visits,
      COUNT(DISTINCT CASE WHEN event_type = 'visit' THEN visitor_key END) AS unique_visitors,
      SUM(CASE WHEN event_type = 'download' THEN 1 ELSE 0 END) AS downloads,
      COUNT(DISTINCT CASE WHEN event_type = 'visit' AND country <> '' THEN country END) AS countries
    FROM analytics_events
    WHERE datetime(created_at) >= datetime('now', ?)
  `).bind(modifier).first();

  const daily = await env.DB.prepare(`
    SELECT
      strftime('%Y-%m-%d', created_at) AS day,
      SUM(CASE WHEN event_type = 'visit' THEN 1 ELSE 0 END) AS visits,
      SUM(CASE WHEN event_type = 'download' THEN 1 ELSE 0 END) AS downloads
    FROM analytics_events
    WHERE datetime(created_at) >= datetime('now', ?)
    GROUP BY strftime('%Y-%m-%d', created_at)
    ORDER BY day ASC
  `).bind(modifier).all();

  const countries = await env.DB.prepare(`
    SELECT country, COUNT(DISTINCT visitor_key) AS visitors,
      SUM(CASE WHEN event_type = 'visit' THEN 1 ELSE 0 END) AS visits
    FROM analytics_events
    WHERE event_type = 'visit' AND datetime(created_at) >= datetime('now', ?)
    GROUP BY country ORDER BY visitors DESC LIMIT 15
  `).bind(modifier).all();

  const mapPoints = await env.DB.prepare(`
    SELECT city, region, country, latitude, longitude,
      COUNT(DISTINCT visitor_key) AS visitors
    FROM analytics_events
    WHERE event_type = 'visit'
      AND latitude IS NOT NULL AND longitude IS NOT NULL
      AND datetime(created_at) >= datetime('now', ?)
    GROUP BY country, region, city, latitude, longitude
    ORDER BY visitors DESC LIMIT 80
  `).bind(modifier).all();

  const recent = await env.DB.prepare(`
    SELECT event_type, page_path, ip_address, city, region, country,
      latitude, longitude, referrer, created_at
    FROM analytics_events
    WHERE event_type = 'visit' AND datetime(created_at) >= datetime('now', ?)
    ORDER BY id DESC LIMIT ?
  `).bind(modifier, MAX_RECENT).all();

  return json({
    ok: true,
    rangeDays: days,
    summary: summary || { visits: 0, unique_visitors: 0, downloads: 0, countries: 0 },
    daily: daily.results || [],
    countries: countries.results || [],
    mapPoints: mapPoints.results || [],
    recent: recent.results || [],
    retentionDays: 30
  }, 200);
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      if (!validOrigin(request, env)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers });
    }

    try {
      if (request.method === "POST" && url.pathname === "/track") {
        const response = await trackEvent(request, env);
        const responseHeaders = new Headers(response.headers);
        Object.entries(headers).forEach(([k, v]) => responseHeaders.set(k, v));
        return new Response(response.body, { status: response.status, headers: responseHeaders });
      }
      if (request.method === "GET" && url.pathname === "/admin/summary") {
        const response = await adminSummary(request, env);
        const responseHeaders = new Headers(response.headers);
        Object.entries(headers).forEach(([k, v]) => responseHeaders.set(k, v));
        return new Response(response.body, { status: response.status, headers: responseHeaders });
      }
      return json({ ok: false, error: "not_found" }, 404, headers);
    } catch (error) {
      console.error("Analytics worker request failed:", error && error.message ? error.message : "unknown_error");
      return json({ ok: false, error: "internal_error" }, 500, headers);
    }
  }
};
