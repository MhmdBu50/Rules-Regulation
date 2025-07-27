-- ============================================================
-- Rules & Regulation Database Export - FIXED VERSION
-- Generated: July 27, 2025
-- Oracle Database 23c
-- All IDs properly start from 1 with correct sequences
-- ============================================================

-- 1. Create Sequences (Auto-increment counters)
-- ============================================================

-- Sequence for USERS table (starts after current max: 8)
CREATE SEQUENCE users_seq
START WITH 9
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

-- Sequence for CONTACT_INFORMATION table (starts after current max: 6)
CREATE SEQUENCE contact_info_seq
START WITH 7
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

-- Sequence for RECORDS table (starts after current max: 10)
CREATE SEQUENCE records_seq
START WITH 11
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

-- Sequence for ATTACHMENTS table
CREATE SEQUENCE attachments_seq
START WITH 1
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

-- 2. Create Tables
-- ============================================================

-- USERS Table
CREATE TABLE users (
    user_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(255) NOT NULL UNIQUE,
    phone_number VARCHAR2(20),
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_email CHECK (REGEXP_LIKE(email, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'))
);

-- CONTACT_INFORMATION Table
CREATE TABLE contact_information (
    contact_id NUMBER PRIMARY KEY,
    department VARCHAR2(100) NOT NULL,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(255),
    mobile VARCHAR2(20),
    telephone VARCHAR2(20),
    CONSTRAINT uk_contact_department UNIQUE (department)
);

-- RECORDS Table
CREATE TABLE records (
    record_id NUMBER PRIMARY KEY,
    user_id NUMBER NOT NULL,
    regulation_name VARCHAR2(255),
    notes CLOB,
    version VARCHAR2(50),
    description CLOB,
    department VARCHAR2(100),
    document_type VARCHAR2(100),
    version_date DATE,
    approval_date DATE,
    sections CLOB,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    approving_entity VARCHAR2(255),
    CONSTRAINT fk_records_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ATTACHMENTS Table
CREATE TABLE attachments (
    attachment_id NUMBER PRIMARY KEY,
    record_id NUMBER NOT NULL,
    file_type VARCHAR2(50),
    file_path VARCHAR2(500),
    upload_date TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attach_record FOREIGN KEY (record_id) REFERENCES records(record_id) ON DELETE CASCADE
);

-- 3. Create Indexes for Performance
-- ============================================================

CREATE INDEX idx_user_records ON records(user_id);
CREATE INDEX idx_records_dates ON records(version_date, approval_date);
CREATE INDEX idx_document_type ON records(document_type);
CREATE INDEX idx_record_attachments ON attachments(record_id);

-- 4. Create Triggers (Auto-increment functionality)
-- ============================================================

-- Trigger for USERS table
CREATE OR REPLACE TRIGGER users_bi
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF :NEW.user_id IS NULL THEN
        SELECT users_seq.NEXTVAL INTO :NEW.user_id FROM dual;
    END IF;
END;
/

-- Trigger for USERS table (update timestamp)
CREATE OR REPLACE TRIGGER users_bu
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Trigger for CONTACT_INFORMATION table
CREATE OR REPLACE TRIGGER contact_info_bi
BEFORE INSERT ON contact_information
FOR EACH ROW
BEGIN
    IF :NEW.contact_id IS NULL THEN
        SELECT contact_info_seq.NEXTVAL INTO :NEW.contact_id FROM dual;
    END IF;
END;
/

-- Trigger for RECORDS table
CREATE OR REPLACE TRIGGER records_bi
BEFORE INSERT ON records
FOR EACH ROW
BEGIN
    IF :NEW.record_id IS NULL THEN
        SELECT records_seq.NEXTVAL INTO :NEW.record_id FROM dual;
    END IF;
END;
/

-- Trigger for ATTACHMENTS table
CREATE OR REPLACE TRIGGER attachments_bi
BEFORE INSERT ON attachments
FOR EACH ROW
BEGIN
    IF :NEW.attachment_id IS NULL THEN
        SELECT attachments_seq.NEXTVAL INTO :NEW.attachment_id FROM dual;
    END IF;
END;
/

-- 5. Insert Sample Data (WITH PROPER IDs STARTING FROM 1)
-- ============================================================

-- Insert USERS data (IDs: 1-8)
INSERT INTO users (user_id, name, email, phone_number, created_at, updated_at) VALUES
(1, 'Admin User', 'admin@iau.edu.sa', '+966501234567', TIMESTAMP '2025-07-23 13:12:03.247000', TIMESTAMP '2025-07-23 13:12:03.247000');

INSERT INTO users (user_id, name, email, phone_number, created_at, updated_at) VALUES
(2, 'Regular User', 'user@iau.edu.sa', '+966507654321', TIMESTAMP '2025-07-23 13:12:08.565000', TIMESTAMP '2025-07-23 13:12:08.565000');

INSERT INTO users (user_id, name, email, phone_number, created_at, updated_at) VALUES
(3, 'Azzam Alzahrani', 'azzam.alzahrani@example.com', '+966500000001', TIMESTAMP '2025-07-23 13:15:02.088000', TIMESTAMP '2025-07-23 13:15:02.088000');

INSERT INTO users (user_id, name, email, phone_number, created_at, updated_at) VALUES
(4, 'Mohammed Bukhamseen', 'm.bukhamseen@example.com', '+966500000002', TIMESTAMP '2025-07-23 13:15:02.088000', TIMESTAMP '2025-07-23 13:15:02.088000');

INSERT INTO users (user_id, name, email, phone_number, created_at, updated_at) VALUES
(5, 'Jalil Almuhaishi', 'j.almuhaishi@example.com', '+966500000003', TIMESTAMP '2025-07-23 13:15:02.088000', TIMESTAMP '2025-07-23 13:15:02.088000');

INSERT INTO users (user_id, name, email, phone_number, created_at, updated_at) VALUES
(6, 'Mohammed Almarshad', 'm.almarshad@example.com', '+966500000004', TIMESTAMP '2025-07-23 13:15:02.088000', TIMESTAMP '2025-07-23 13:15:02.088000');

INSERT INTO users (user_id, name, email, phone_number, created_at, updated_at) VALUES
(7, 'Ahmed Alnas', 'ahmed.alnas@example.com', '+966500000005', TIMESTAMP '2025-07-23 13:15:02.088000', TIMESTAMP '2025-07-23 13:15:02.088000');

INSERT INTO users (user_id, name, email, phone_number, created_at, updated_at) VALUES
(8, 'Haydar AboAlmkarm', 'haydar.aboalmkarm@example.com', '+966500000006', TIMESTAMP '2025-07-23 13:15:02.088000', TIMESTAMP '2025-07-23 13:15:02.088000');

-- Insert CONTACT_INFORMATION data (IDs: 1-6)
INSERT INTO contact_information (contact_id, department, name, email, mobile, telephone) VALUES
(1, 'CCSIT', 'د. محمد أحمد', 'mohamed.ahmed@iau.edu.sa', '501234567', '013123456');

INSERT INTO contact_information (contact_id, department, name, email, mobile, telephone) VALUES
(2, 'Communication and tech', 'عزام', 'azzam@iau.com', '538889030', '13846372');

INSERT INTO contact_information (contact_id, department, name, email, mobile, telephone) VALUES
(3, 'Hospital', 'جليل', 'JALIL@iau.com', '512223333', '13846372');

INSERT INTO contact_information (contact_id, department, name, email, mobile, telephone) VALUES
(4, 'Reg and Admission', 'محمد المرشد', 'marshad@gmail.com', '543335454', '13846372');

INSERT INTO contact_information (contact_id, department, name, email, mobile, telephone) VALUES
(5, 'Library', 'azaz', 'zaz@h.com', '535557777', '1323233');

INSERT INTO contact_information (contact_id, department, name, email, mobile, telephone) VALUES
(6, 'Students Affairs', 'ابوخمسييييين', 'marshad@gmail.com', '542221111', '13846372');

-- Insert RECORDS data (IDs: 1-10)
INSERT INTO records (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(1, 1, 'Academic Program Review and Development Guide', 'Covers the process for evaluating academic programs periodically.', '3rd Edition', 'Approved by the University Council, session 45.', 'Academic Planning Department', 'Guide', DATE '2021-01-01', DATE '2015-12-28', '{"students": true, "members": false, "enrolled_program": true}', TIMESTAMP '2025-07-23 13:17:46.825000', 'University Council');

INSERT INTO records (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(2, 1, 'asfdaf', 'dsd', '2', 'adsd', 'HR', 'regulation', DATE '2025-07-03', DATE '2025-07-11', 'students', TIMESTAMP '2025-07-24 14:15:57.526432', 'azzam');

INSERT INTO records (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(3, 1, 'jalil', 'jalil test', '3', 'jalil test', 'Library', 'policy', DATE '2025-07-23', DATE '2025-07-26', 'members,program', TIMESTAMP '2025-07-24 14:21:55.113796', 'jalil');

INSERT INTO records (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(4, 1, 'asa', 'ddddd', '3', 'sdfsvs', 'Communication and tech', 'regulation', DATE '2025-07-23', DATE '2025-07-29', 'students,members,program', TIMESTAMP '2025-07-24 14:27:52.663137', 'azzam');

INSERT INTO records (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(5, 1, 'g', 'rth45', '111', '5yth', 'CCSIT', 'regulation', DATE '2025-07-17', DATE '2025-07-15', 'students,members', TIMESTAMP '2025-07-24 14:33:42.060067', 'azzam');

INSERT INTO records (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(6, 1, 'g', 'thdth', '2', 'jgvj', 'Reg and Admission', 'guideline', DATE '2025-07-03', DATE '2025-07-19', 'members', TIMESTAMP '2025-07-24 14:36:20.839296', 'azzam');

INSERT INTO records (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(7, 1, 'm7md', 'tst', '10', 'tst', 'CCSIT', 'policy', DATE '2025-07-10', DATE '2025-07-10', 'students,members,program', TIMESTAMP '2025-07-24 15:59:30.053623', 'azzam');

INSERT INTO records (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(8, 1, 'jaleeel reg)))))', 'tst', '999', 'tst', 'Library', 'guideline', DATE '2025-07-18', DATE '2025-07-18', 'students,members,program', TIMESTAMP '2025-07-24 16:11:30.628408', 'azzam');

INSERT INTO records (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(9, 1, 'haydar REG', 'jkdsbv skjdvbn knbv v fs', 'G', 'hefvcbhkejdbcf njweksdnfcvjlkwerdhnfvgwsdlrv', 'Hospital', 'policy', DATE '2025-07-09', DATE '2025-07-09', 'students', TIMESTAMP '2025-07-24 16:52:37.781558', 'Hamburger');

INSERT INTO records (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(10, 1, '2025', 'test', '1', 'test', 'CCSIT', 'regulation', DATE '2025-07-24', DATE '2025-07-24', 'students,members', TIMESTAMP '2025-07-27 10:30:00.000000', 'admin');

-- Commit all changes
COMMIT;

-- ============================================================
-- Verification Queries
-- ============================================================

-- Verify all IDs start from 1 and are sequential
SELECT 'USERS: IDs ' || MIN(user_id) || ' to ' || MAX(user_id) || ' (' || COUNT(*) || ' records)' as summary FROM users;
SELECT 'CONTACTS: IDs ' || MIN(contact_id) || ' to ' || MAX(contact_id) || ' (' || COUNT(*) || ' records)' as summary FROM contact_information;
SELECT 'RECORDS: IDs ' || MIN(record_id) || ' to ' || MAX(record_id) || ' (' || COUNT(*) || ' records)' as summary FROM records;

-- Verify sequences are correctly set
SELECT sequence_name || ': Next value = ' || last_number as sequence_status
FROM user_sequences 
WHERE sequence_name IN ('USERS_SEQ', 'CONTACT_INFO_SEQ', 'RECORDS_SEQ', 'ATTACHMENTS_SEQ')
ORDER BY sequence_name;

-- ============================================================
-- Installation Instructions:
-- ============================================================
-- 1. Install Oracle Database (Oracle XE is free for development)
-- 2. Connect to Oracle using SQL*Plus, SQLcl, or SQL Developer
-- 3. Run this entire script in order
-- 4. The database will be created with properly numbered IDs starting from 1
-- 5. All sequences are aligned to prevent future ID conflicts
-- 
-- Example connection string:
-- Data Source=localhost:1521/FREEPDB1;User Id=system;Password=yourpassword;
-- ============================================================

SELECT 'Database created successfully with proper ID numbering!' AS message FROM dual;
