# Artboard Studio Visitor Analytics Worker

This Cloudflare Worker records page visits and download clicks for the GitHub Pages site, then serves an admin-only analytics dashboard.

## Data collected

- The visitor IP as received from Cloudflare's `CF-Connecting-IP` header.
- Approximate Cloudflare network geolocation: city, region, country and latitude/longitude.
- A random browser identifier kept in browser local storage and stored only as an HMAC in D1 for unique-visitor counting.
- Page path, referrer, event type and timestamp.

IP addresses and visit-level records are retained for **30 days**. Old rows are removed during incoming tracking requests. The location is approximate (often a city/network area), not a home or street address. Download numbers are **download-link clicks**, not proof that the file finished downloading.

The dashboard endpoint checks Firebase ID tokens with Firebase Identity Toolkit and permits only the verified `rafathamed9@gmail.com` admin account. Never expose an admin API token or the D1 database credentials.

## Deploy from Windows PowerShell

Run these commands from the `analytics-worker` folder:

1. Copy the config template:

   ```powershell
   Copy-Item wrangler.toml.example wrangler.toml
   ```

2. Log in to Cloudflare (skip if already logged in):

   ```powershell
   npx.cmd wrangler login
   ```

3. Create the D1 database:

   ```powershell
   npx.cmd wrangler d1 create artboard-studio-analytics
   ```

   Cloudflare prints a database UUID. Open `wrangler.toml` and replace `PASTE_D1_DATABASE_ID_HERE` with that exact UUID.

4. Create the table and indexes:

   ```powershell
   npx.cmd wrangler d1 execute artboard-studio-analytics --remote --file=./schema.sql
   ```

5. Add the Firebase Web API key as a Worker secret. Use the API key from the existing Firebase web app configuration in `admin-panel.js` / `index.html`:

   ```powershell
   npx.cmd wrangler secret put FIREBASE_API_KEY
   ```

6. Add a private random key used to hash browser identifiers. Generate one in PowerShell and paste it when Wrangler prompts:

   ```powershell
   ([guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N"))
   ```

   ```powershell
   npx.cmd wrangler secret put VISITOR_HASH_SECRET
   ```

7. Deploy:

   ```powershell
   npx.cmd wrangler deploy
   ```

Cloudflare prints the Worker URL. The default expected URL for the existing `rafat-hamed` workers.dev subdomain is:

```
https://artboard-studio-analytics.rafat-hamed.workers.dev
```

If Cloudflare prints a different URL, update `ANALYTICS_API_URL` near the top of the main site's `admin-panel.js` to that exact URL, then commit and push the change.

## Firebase requirements

- The project must use Firebase Authentication Email/Password.
- `rafathamed9@gmail.com` must be an existing user with a verified email.
- The Firebase API key used by the Worker must allow the Identity Toolkit API. If the key has HTTP-referrer restrictions, adjust them so the Worker-side Identity Toolkit lookup is allowed.

## Dashboard endpoints

- `POST /track` — public, accepts only `visit` and `download` events from the configured site origin.
- `GET /admin/summary?days=7|30` — Firebase-admin authenticated summary, daily counts, countries, map points and recent visit/IP records.

## Privacy and operational notes

The exact IP is personal data. Add a clear privacy notice on the website explaining analytics, IP and approximate-location collection, the 30-day retention period and the purpose of collection. Restrict access to the GitHub repository and Cloudflare account, and do not share exported visit logs publicly.

Cloudflare request geolocation is approximate and may be unavailable for some requests. The map displays only records for which Cloudflare supplies coordinates. Browser privacy tools, ad blockers and network settings may prevent an event from being recorded.
