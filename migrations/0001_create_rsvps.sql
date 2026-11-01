-- RSVP responses. One row per device; re-submitting from the same device updates the row.
CREATE TABLE IF NOT EXISTS rsvps (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id   TEXT    NOT NULL UNIQUE,
  name        TEXT    NOT NULL,
  attending   INTEGER NOT NULL CHECK (attending IN (0, 1)),
  guests      INTEGER NOT NULL DEFAULT 0 CHECK (guests BETWEEN 0 AND 10),
  message     TEXT,
  lang        TEXT    NOT NULL DEFAULT 'en',
  ip_hash     TEXT,
  user_agent  TEXT,
  revision    INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rsvps_updated ON rsvps (updated_at);
CREATE INDEX IF NOT EXISTS idx_rsvps_ip ON rsvps (ip_hash, updated_at);
