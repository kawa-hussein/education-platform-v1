CREATE TABLE IF NOT EXISTS module_records (
  id TEXT PRIMARY KEY,
  module_code TEXT NOT NULL,
  section_key TEXT,
  tenant_id TEXT,
  branch_id TEXT,
  record_type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  description TEXT,
  data_json TEXT NOT NULL DEFAULT '{}',
  owner_user_id TEXT,
  created_by TEXT NOT NULL,
  updated_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (owner_user_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_module_records_provider ON module_records(module_code,created_at DESC) WHERE tenant_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_module_records_tenant ON module_records(tenant_id,module_code,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_module_records_branch ON module_records(branch_id,module_code,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_module_records_status ON module_records(module_code,status);

INSERT OR REPLACE INTO system_metadata(key,value,updated_at) VALUES('schema_version','4',CURRENT_TIMESTAMP);
