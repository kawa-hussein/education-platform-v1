PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','invited','suspended','disabled')),
  preferred_language TEXT NOT NULL DEFAULT 'en',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_hash TEXT,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);

CREATE TABLE IF NOT EXISTS plans (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  branch_limit INTEGER,
  student_limit INTEGER,
  staff_limit INTEGER,
  storage_mb INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO plans(code,name,description,branch_limit,student_limit,staff_limit,storage_mb)
VALUES
('trial','Trial','Free pilot plan for development and testing',3,500,100,512),
('starter','Starter','Single-school starter plan',1,1000,150,2048),
('professional','Professional','Multi-branch school group plan',10,10000,1500,10240),
('enterprise','Enterprise','Custom enterprise plan',NULL,NULL,NULL,NULL);

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  legal_name TEXT,
  status TEXT NOT NULL DEFAULT 'trial' CHECK(status IN ('trial','active','renewal_due','past_due','grace','restricted','suspended','cancelled','archived')),
  plan_code TEXT NOT NULL DEFAULT 'trial' REFERENCES plans(code),
  country TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Baghdad',
  default_currency TEXT NOT NULL DEFAULT 'IQD',
  default_language TEXT NOT NULL DEFAULT 'en',
  starts_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenant_settings (
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  locked INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(tenant_id, setting_key)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_code TEXT NOT NULL REFERENCES plans(code),
  status TEXT NOT NULL DEFAULT 'trial',
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  renewal_at TEXT,
  auto_renew INTEGER NOT NULL DEFAULT 0,
  branch_limit INTEGER,
  student_limit INTEGER,
  staff_limit INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id);

CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'school',
  status TEXT NOT NULL DEFAULT 'active',
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  timezone TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, code)
);
CREATE INDEX IF NOT EXISTS idx_branches_tenant ON branches(tenant_id);

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'department',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, branch_id, code)
);

CREATE TABLE IF NOT EXISTS role_assignments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_code TEXT NOT NULL,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE CASCADE,
  department_id TEXT REFERENCES departments(id) ON DELETE CASCADE,
  starts_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ends_at TEXT,
  can_delegate INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_role_assignments_user ON role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_scope ON role_assignments(tenant_id, branch_id, department_id);

CREATE TABLE IF NOT EXISTS academic_years (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  starts_on TEXT NOT NULL,
  ends_on TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  is_current INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS terms (
  id TEXT PRIMARY KEY,
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  starts_on TEXT NOT NULL,
  ends_on TEXT NOT NULL,
  sequence_no INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS grade_levels (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  sequence_no INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(tenant_id, branch_id, code)
);

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  academic_year_id TEXT REFERENCES academic_years(id) ON DELETE SET NULL,
  grade_level_id TEXT REFERENCES grade_levels(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  homeroom_staff_id TEXT,
  capacity INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(tenant_id, branch_id, academic_year_id, code)
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  student_no TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL DEFAULT '',
  preferred_name TEXT,
  date_of_birth TEXT,
  gender TEXT,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('future','active','on_leave','withdrawn','graduated','archived')),
  grade_level_id TEXT REFERENCES grade_levels(id) ON DELETE SET NULL,
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  admission_date TEXT,
  exit_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, student_no)
);
CREATE INDEX IF NOT EXISTS idx_students_scope ON students(tenant_id, branch_id, status);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(last_name, first_name);

CREATE TABLE IF NOT EXISTS guardians (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_guardians (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  guardian_id TEXT NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  legal_guardian INTEGER NOT NULL DEFAULT 0,
  lives_with_student INTEGER NOT NULL DEFAULT 0,
  emergency_contact INTEGER NOT NULL DEFAULT 0,
  pickup_authorized INTEGER NOT NULL DEFAULT 0,
  receives_academic INTEGER NOT NULL DEFAULT 1,
  receives_attendance INTEGER NOT NULL DEFAULT 1,
  receives_finance INTEGER NOT NULL DEFAULT 0,
  priority_no INTEGER,
  starts_at TEXT,
  ends_at TEXT,
  UNIQUE(student_id, guardian_id, relationship_type)
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  employee_no TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  employment_status TEXT NOT NULL DEFAULT 'active',
  hire_date TEXT,
  termination_date TEXT,
  job_title TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, employee_no)
);

CREATE TABLE IF NOT EXISTS staff_assignments (
  id TEXT PRIMARY KEY,
  staff_id TEXT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE CASCADE,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  assignment_type TEXT NOT NULL DEFAULT 'employee',
  title TEXT,
  workload_percent REAL NOT NULL DEFAULT 100,
  cost_allocation_percent REAL NOT NULL DEFAULT 100,
  starts_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ends_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_staff_assignment_scope ON staff_assignments(tenant_id, branch_id);

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(tenant_id, branch_id, code)
);

CREATE TABLE IF NOT EXISTS course_sections (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  academic_year_id TEXT REFERENCES academic_years(id) ON DELETE SET NULL,
  term_id TEXT REFERENCES terms(id) ON DELETE SET NULL,
  subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  teacher_staff_id TEXT REFERENCES staff(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS class_enrollments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_section_id TEXT NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  starts_on TEXT,
  ends_on TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(student_id, course_section_id)
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  attendance_date TEXT NOT NULL,
  period_code TEXT NOT NULL DEFAULT 'daily',
  course_section_id TEXT REFERENCES course_sections(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK(status IN ('present','absent','late','excused','medical','authorized','activity','left_early')),
  minutes_late INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  note TEXT,
  recorded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, attendance_date, period_code, course_section_id)
);
CREATE INDEX IF NOT EXISTS idx_attendance_scope_date ON attendance_records(tenant_id, branch_id, attendance_date);

CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  course_section_id TEXT REFERENCES course_sections(id) ON DELETE CASCADE,
  term_id TEXT REFERENCES terms(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  assessment_type TEXT NOT NULL DEFAULT 'assessment',
  max_score REAL NOT NULL DEFAULT 100,
  weight REAL,
  due_on TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS student_grades (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score REAL,
  grade_text TEXT,
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assessment_id, student_id)
);

CREATE TABLE IF NOT EXISTS fee_structures (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE CASCADE,
  academic_year_id TEXT REFERENCES academic_years(id) ON DELETE SET NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'IQD',
  frequency TEXT NOT NULL DEFAULT 'one_time',
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS student_accounts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  opening_balance REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'IQD',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
  invoice_no TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  due_date TEXT,
  currency TEXT NOT NULL DEFAULT 'IQD',
  subtotal REAL NOT NULL DEFAULT 0,
  discount_total REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  paid_total REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'issued',
  notes TEXT,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, invoice_no)
);
CREATE INDEX IF NOT EXISTS idx_invoices_scope ON invoices(tenant_id, branch_id, status);

CREATE TABLE IF NOT EXISTS invoice_lines (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL DEFAULT 0,
  amount REAL NOT NULL DEFAULT 0,
  fee_structure_id TEXT REFERENCES fee_structures(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
  student_id TEXT REFERENCES students(id) ON DELETE SET NULL,
  invoice_id TEXT REFERENCES invoices(id) ON DELETE SET NULL,
  receipt_no TEXT NOT NULL,
  payment_date TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IQD',
  method TEXT NOT NULL DEFAULT 'cash',
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  received_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, receipt_no)
);

CREATE TABLE IF NOT EXISTS compensation_profiles (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  staff_id TEXT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE CASCADE,
  compensation_type TEXT NOT NULL CHECK(compensation_type IN ('monthly','hourly','per_lesson','per_session','per_course','per_student','percentage','hybrid')),
  base_amount REAL NOT NULL DEFAULT 0,
  rate REAL NOT NULL DEFAULT 0,
  percentage_rate REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'IQD',
  percentage_basis TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS payroll_periods (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  starts_on TEXT NOT NULL,
  ends_on TEXT NOT NULL,
  pay_date TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS payroll_entries (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE SET NULL,
  payroll_period_id TEXT NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
  staff_id TEXT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  base_pay REAL NOT NULL DEFAULT 0,
  variable_pay REAL NOT NULL DEFAULT 0,
  bonus REAL NOT NULL DEFAULT 0,
  allowances REAL NOT NULL DEFAULT 0,
  deductions REAL NOT NULL DEFAULT 0,
  net_pay REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  calculation_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(payroll_period_id, staff_id, branch_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE CASCADE,
  recipient_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  event_code TEXT,
  channel TEXT NOT NULL DEFAULT 'in_app',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_at TEXT,
  sent_at TEXT,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE CASCADE,
  import_type TEXT NOT NULL,
  source_filename TEXT,
  total_rows INTEGER NOT NULL DEFAULT 0,
  valid_rows INTEGER NOT NULL DEFAULT 0,
  warning_rows INTEGER NOT NULL DEFAULT 0,
  error_rows INTEGER NOT NULL DEFAULT 0,
  imported_rows INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'queued',
  summary_json TEXT,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id TEXT REFERENCES branches(id) ON DELETE SET NULL,
  ticket_no TEXT NOT NULL UNIQUE,
  requester_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  category TEXT,
  severity TEXT NOT NULL DEFAULT 'normal',
  priority TEXT NOT NULL DEFAULT 'normal',
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  assigned_to_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE SET NULL,
  branch_id TEXT REFERENCES branches(id) ON DELETE SET NULL,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  event_code TEXT,
  old_value_json TEXT,
  new_value_json TEXT,
  reason TEXT,
  request_id TEXT,
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_scope_time ON audit_logs(tenant_id, branch_id, created_at);
