CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_key TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('visit', 'download')),
  page_path TEXT NOT NULL DEFAULT '/',
  ip_address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  latitude REAL,
  longitude REAL,
  referrer TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created
  ON analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created
  ON analytics_events(event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_ip_created
  ON analytics_events(ip_address, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_events_location
  ON analytics_events(country, city, region);
