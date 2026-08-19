CREATE TABLE IF NOT EXISTS provider_invitations (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE,
  name TEXT NOT NULL,
  role_code TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  permission_overrides_json TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','revoked','expired')),
  expires_at TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  accepted_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  accepted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_provider_invitations_status ON provider_invitations(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_provider_invitations_email ON provider_invitations(email);

CREATE TABLE IF NOT EXISTS provider_user_permission_overrides (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_code TEXT NOT NULL,
  effect TEXT NOT NULL CHECK(effect IN ('allow','deny')),
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, permission_code)
);
CREATE INDEX IF NOT EXISTS idx_provider_permission_user ON provider_user_permission_overrides(user_id);

INSERT OR REPLACE INTO system_metadata(key,value) VALUES
('schema_version','3'),
('provider_access_version','P29-v1');
