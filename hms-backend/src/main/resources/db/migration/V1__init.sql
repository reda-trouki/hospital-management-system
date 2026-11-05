-- Portable between PostgreSQL and H2 (PostgreSQL mode).

CREATE TABLE users (
  id        VARCHAR(32)  PRIMARY KEY,
  name      VARCHAR(120) NOT NULL,
  email     VARCHAR(160) NOT NULL UNIQUE,
  password  VARCHAR(100) NOT NULL,
  role      VARCHAR(20)  NOT NULL,
  linked_id VARCHAR(32)
);

CREATE TABLE app_settings (
  id            BIGINT       PRIMARY KEY,
  hospital_name VARCHAR(120) NOT NULL,
  tax_rate      NUMERIC(5,2) NOT NULL
);

CREATE TABLE patients (
  id                VARCHAR(32)  PRIMARY KEY,
  name              VARCHAR(120) NOT NULL,
  age               INTEGER      NOT NULL,
  gender            VARCHAR(10)  NOT NULL,
  phone             VARCHAR(40),
  blood_type        VARCHAR(4),
  medical_condition VARCHAR(200) NOT NULL,
  status            VARCHAR(20)  NOT NULL,
  admitted_on       DATE,
  bed_id            VARCHAR(32),
  allergies         VARCHAR(300),
  emergency_contact VARCHAR(200),
  insurer           VARCHAR(100),
  policy_no         VARCHAR(60),
  coverage          INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE doctors (
  id            VARCHAR(32)  PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  specialty     VARCHAR(80)  NOT NULL,
  phone         VARCHAR(40),
  status        VARCHAR(20)  NOT NULL,
  patient_count INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE beds (
  id         VARCHAR(32) PRIMARY KEY,
  ward       VARCHAR(40) NOT NULL,
  bed_number INTEGER     NOT NULL,
  patient_id VARCHAR(32) REFERENCES patients(id) ON DELETE SET NULL
);

CREATE TABLE appointments (
  id         VARCHAR(32)  PRIMARY KEY,
  patient_id VARCHAR(32)  NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id  VARCHAR(32)  NOT NULL REFERENCES doctors(id),
  appt_date  DATE         NOT NULL,
  appt_time  TIME         NOT NULL,
  reason     VARCHAR(200) NOT NULL,
  status     VARCHAR(20)  NOT NULL
);
CREATE INDEX idx_appt_doctor_slot ON appointments (doctor_id, appt_date, appt_time);
CREATE INDEX idx_appt_patient ON appointments (patient_id);

CREATE TABLE invoices (
  id            VARCHAR(32)  PRIMARY KEY,
  patient_id    VARCHAR(32)  NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  discount_pct  NUMERIC(5,2) NOT NULL,
  tax_pct       NUMERIC(5,2) NOT NULL,
  insurance_pct NUMERIC(5,2) NOT NULL,
  issued_on     DATE         NOT NULL,
  due_on        DATE         NOT NULL
);
CREATE INDEX idx_invoice_patient ON invoices (patient_id);

CREATE TABLE invoice_items (
  invoice_id  VARCHAR(32)   NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_no     INTEGER       NOT NULL,
  description VARCHAR(200)  NOT NULL,
  qty         INTEGER       NOT NULL,
  price       NUMERIC(12,2) NOT NULL,
  PRIMARY KEY (invoice_id, line_no)
);

CREATE TABLE invoice_payments (
  invoice_id VARCHAR(32)   NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  payment_no INTEGER       NOT NULL,
  paid_on    DATE          NOT NULL,
  amount     NUMERIC(12,2) NOT NULL,
  method     VARCHAR(20)   NOT NULL,
  PRIMARY KEY (invoice_id, payment_no)
);

CREATE TABLE vitals (
  id          VARCHAR(32)  PRIMARY KEY,
  patient_id  VARCHAR(32)  NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  bp          VARCHAR(12)  NOT NULL,
  hr          INTEGER      NOT NULL,
  temp        DOUBLE PRECISION NOT NULL,
  spo2        INTEGER      NOT NULL,
  weight      DOUBLE PRECISION,
  recorded_by VARCHAR(120) NOT NULL
);
CREATE INDEX idx_vitals_patient ON vitals (patient_id);

CREATE TABLE notes (
  id         VARCHAR(32)   PRIMARY KEY,
  patient_id VARCHAR(32)   NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  author     VARCHAR(120)  NOT NULL,
  note_type  VARCHAR(20)   NOT NULL,
  note_text  VARCHAR(4000) NOT NULL
);
CREATE INDEX idx_notes_patient ON notes (patient_id);

CREATE TABLE items (
  id               VARCHAR(32)   PRIMARY KEY,
  name             VARCHAR(160)  NOT NULL,
  category         VARCHAR(20)   NOT NULL,
  stock            INTEGER       NOT NULL,
  reorder_level    INTEGER       NOT NULL DEFAULT 0,
  unit             VARCHAR(30),
  price            NUMERIC(12,2) NOT NULL DEFAULT 0,
  location         VARCHAR(80),
  expiry_date      DATE,
  next_maintenance DATE
);

CREATE TABLE prescriptions (
  id            VARCHAR(32)  PRIMARY KEY,
  patient_id    VARCHAR(32)  NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id     VARCHAR(32)  NOT NULL REFERENCES doctors(id),
  item_id       VARCHAR(32)  NOT NULL REFERENCES items(id),
  dosage        VARCHAR(200) NOT NULL,
  duration_text VARCHAR(80),
  qty           INTEGER      NOT NULL,
  instructions  VARCHAR(300),
  rx_date       DATE         NOT NULL,
  status        VARCHAR(20)  NOT NULL
);
CREATE INDEX idx_rx_patient ON prescriptions (patient_id);

CREATE TABLE lab_orders (
  id         VARCHAR(32)  PRIMARY KEY,
  patient_id VARCHAR(32)  NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id  VARCHAR(32)  NOT NULL REFERENCES doctors(id),
  test       VARCHAR(120) NOT NULL,
  priority   VARCHAR(10)  NOT NULL,
  ordered_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status     VARCHAR(20)  NOT NULL,
  result     VARCHAR(2000),
  flag       VARCHAR(10)
);
CREATE INDEX idx_lab_patient ON lab_orders (patient_id);

CREATE TABLE emergency_cases (
  id           VARCHAR(32)  PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  age          INTEGER      NOT NULL,
  complaint    VARCHAR(300) NOT NULL,
  triage       INTEGER      NOT NULL,
  arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status       VARCHAR(20)  NOT NULL
);

CREATE TABLE surgeries (
  id             VARCHAR(32)  PRIMARY KEY,
  patient_id     VARCHAR(32)  NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  surgeon_id     VARCHAR(32)  NOT NULL REFERENCES doctors(id),
  procedure_name VARCHAR(200) NOT NULL,
  room           VARCHAR(20)  NOT NULL,
  surgery_date   DATE         NOT NULL,
  start_time     TIME         NOT NULL,
  duration_min   INTEGER      NOT NULL,
  status         VARCHAR(20)  NOT NULL
);
CREATE INDEX idx_surgery_room ON surgeries (room, surgery_date);

CREATE TABLE staff (
  id         VARCHAR(32)  PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  role       VARCHAR(30)  NOT NULL,
  department VARCHAR(80),
  phone      VARCHAR(40),
  shifts     VARCHAR(100) NOT NULL
);

CREATE TABLE audit_log (
  id         VARCHAR(32)  PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_name  VARCHAR(120) NOT NULL,
  user_role  VARCHAR(20)  NOT NULL,
  action     VARCHAR(500) NOT NULL
);
CREATE INDEX idx_audit_created ON audit_log (created_at);
