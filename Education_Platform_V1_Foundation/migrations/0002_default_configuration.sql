INSERT OR IGNORE INTO plans(code,name,description,branch_limit,student_limit,staff_limit,storage_mb)
VALUES ('academy','Academy','After-school and academy focused plan',5,3000,500,5120);

CREATE TABLE IF NOT EXISTS system_metadata (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO system_metadata(key,value) VALUES
('schema_version','2'),
('architecture_version','V6.0'),
('product_stage','V1 Foundation');
