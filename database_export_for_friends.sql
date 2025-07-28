-- ============================================================
-- COMPLETE DATABASE EXPORT FOR FRIENDS
-- Generated: July 28, 2025
-- This is the WORKING database with correct document types
-- ============================================================

-- ============================================================
-- 1. DROP EXISTING TABLES AND SEQUENCES (Clean Slate)
-- ============================================================

-- Drop sequences first
BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE USERS_SEQ';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE RECORDS_SEQ';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE ATTACHMENTS_SEQ';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE CONTACT_INFO_SEQ';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE ADMINS_SEQ';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE INTERACTIONS_SEQ';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE HISTORY_SEQ';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE VISITS_SEQ';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE SEARCH_LOGS_SEQ';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE SAVED_RECORDS_SEQ';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE CHATBOT_SEQ';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

-- Drop tables in correct order (dependencies)
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE HISTORY CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE SEARCH_LOGS CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE SAVED_RECORDS CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE CHATBOT_INTERACTIONS CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE INTERACTIONS CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE ATTACHMENTS CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE RECORDS CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE ADMINS CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE VISITS CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE CONTACT_INFORMATION CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE USERS CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

-- ============================================================
-- 2. CREATE SEQUENCES
-- ============================================================

CREATE SEQUENCE USERS_SEQ
START WITH 29
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

CREATE SEQUENCE RECORDS_SEQ
START WITH 11
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

CREATE SEQUENCE ATTACHMENTS_SEQ
START WITH 1
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

CREATE SEQUENCE CONTACT_INFO_SEQ
START WITH 7
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

CREATE SEQUENCE ADMINS_SEQ
START WITH 1
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

CREATE SEQUENCE INTERACTIONS_SEQ
START WITH 1
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

CREATE SEQUENCE HISTORY_SEQ
START WITH 1
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

CREATE SEQUENCE VISITS_SEQ
START WITH 1
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

CREATE SEQUENCE SEARCH_LOGS_SEQ
START WITH 1
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

CREATE SEQUENCE SAVED_RECORDS_SEQ
START WITH 1
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

CREATE SEQUENCE CHATBOT_SEQ
START WITH 1
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

-- ============================================================
-- 3. CREATE TABLES
-- ============================================================

-- USERS table (main user accounts)
CREATE TABLE USERS (
    user_id NUMBER NOT NULL,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(255) NOT NULL,
    phone_number VARCHAR2(20),
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT chk_email CHECK (email LIKE '%@%')
);

-- CONTACT_INFORMATION table (department contacts)
CREATE TABLE CONTACT_INFORMATION (
    contact_id NUMBER NOT NULL,
    department VARCHAR2(100) NOT NULL,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(255),
    mobile VARCHAR2(20),
    telephone VARCHAR2(20),
    
    CONSTRAINT pk_contact_info PRIMARY KEY (contact_id)
);

-- RECORDS table (main regulations/documents)
CREATE TABLE RECORDS (
    record_id NUMBER NOT NULL,
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
    approving_entity VARCHAR2(1020),
    
    CONSTRAINT pk_records PRIMARY KEY (record_id),
    CONSTRAINT fk_records_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- ATTACHMENTS table (file attachments)
CREATE TABLE ATTACHMENTS (
    attachment_id NUMBER NOT NULL,
    record_id NUMBER NOT NULL,
    file_type VARCHAR2(50),
    file_path VARCHAR2(500),
    upload_date TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_attachments PRIMARY KEY (attachment_id),
    CONSTRAINT fk_attach_record FOREIGN KEY (record_id) REFERENCES RECORDS(record_id) ON DELETE CASCADE
);

-- ADMINS table (admin users)
CREATE TABLE ADMINS (
    admin_id NUMBER NOT NULL,
    user_id NUMBER NOT NULL,
    admin_level VARCHAR2(50),
    
    CONSTRAINT pk_admins PRIMARY KEY (admin_id),
    CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT uk_admin_user UNIQUE (user_id)
);

-- VISITS table (user visit tracking)
CREATE TABLE VISITS (
    visit_id NUMBER NOT NULL,
    user_id NUMBER NOT NULL,
    ip_address VARCHAR2(45),
    visit_date DATE NOT NULL,
    visit_time VARCHAR2(8),
    
    CONSTRAINT pk_visits PRIMARY KEY (visit_id),
    CONSTRAINT fk_visits_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_ip_format CHECK (ip_address IS NULL OR REGEXP_LIKE(ip_address, '^[0-9.:]+$'))
);

-- INTERACTIONS table (user-record interactions)
CREATE TABLE INTERACTIONS (
    interaction_id NUMBER NOT NULL,
    user_id NUMBER NOT NULL,
    record_id NUMBER NOT NULL,
    interaction_type VARCHAR2(100),
    interaction_date TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_interactions PRIMARY KEY (interaction_id),
    CONSTRAINT fk_inter_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_inter_record FOREIGN KEY (record_id) REFERENCES RECORDS(record_id) ON DELETE CASCADE
);

-- HISTORY table (user access history)
CREATE TABLE HISTORY (
    history_id NUMBER NOT NULL,
    user_id NUMBER NOT NULL,
    record_id NUMBER,
    access_date TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR2(100),
    
    CONSTRAINT pk_history PRIMARY KEY (history_id),
    CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_history_record FOREIGN KEY (record_id) REFERENCES RECORDS(record_id) ON DELETE SET NULL
);

-- SEARCH_LOGS table (search tracking)
CREATE TABLE SEARCH_LOGS (
    log_id NUMBER NOT NULL,
    user_id NUMBER NOT NULL,
    search_id VARCHAR2(100),
    keyword VARCHAR2(255),
    search_timestamp TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_search_logs PRIMARY KEY (log_id),
    CONSTRAINT fk_search_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT uk_search_id UNIQUE (search_id)
);

-- SAVED_RECORDS table (user saved documents)
CREATE TABLE SAVED_RECORDS (
    record_id NUMBER NOT NULL,
    user_id NUMBER NOT NULL,
    saved_timestamp VARCHAR2(50),
    saved_id VARCHAR2(100),
    
    CONSTRAINT pk_saved_records PRIMARY KEY (record_id),
    CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT uk_saved_id UNIQUE (saved_id)
);

-- CHATBOT_INTERACTIONS table (chatbot conversations)
CREATE TABLE CHATBOT_INTERACTIONS (
    interaction_id NUMBER NOT NULL,
    user_id NUMBER NOT NULL,
    shall_id VARCHAR2(100),
    respond CLOB,
    question CLOB,
    timestamp_stamp VARCHAR2(50),
    interaction_timestamp TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_chatbot_interactions PRIMARY KEY (interaction_id),
    CONSTRAINT fk_chatbot_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 4. CREATE INDEXES
-- ============================================================

-- Performance indexes
CREATE INDEX idx_document_type ON RECORDS(document_type);
CREATE INDEX idx_records_dates ON RECORDS(version_date, approval_date);
CREATE INDEX idx_user_records ON RECORDS(user_id);
CREATE INDEX idx_record_attachments ON ATTACHMENTS(record_id);
CREATE INDEX idx_user_interactions ON INTERACTIONS(user_id);
CREATE INDEX idx_record_interactions ON INTERACTIONS(record_id);
CREATE INDEX idx_interactions_type_date ON INTERACTIONS(interaction_type, interaction_date);
CREATE INDEX idx_user_history ON HISTORY(user_id);
CREATE INDEX idx_access_date ON HISTORY(access_date);
CREATE INDEX idx_history_action ON HISTORY(action);
CREATE INDEX idx_user_visits ON VISITS(user_id);
CREATE INDEX idx_visit_date ON VISITS(visit_date);
CREATE INDEX idx_user_searches ON SEARCH_LOGS(user_id);
CREATE INDEX idx_search_timestamp ON SEARCH_LOGS(search_timestamp);
CREATE INDEX idx_user_saved ON SAVED_RECORDS(user_id);
CREATE INDEX idx_user_chatbot ON CHATBOT_INTERACTIONS(user_id);

-- ============================================================
-- 5. INSERT SAMPLE DATA
-- ============================================================

-- Insert USERS data (IDs: 1-8)
INSERT INTO USERS (user_id, name, email, phone_number) VALUES
(1, 'Admin User', 'admin@iau.edu.sa', '501234567');

INSERT INTO USERS (user_id, name, email, phone_number) VALUES
(2, 'John Doe', 'john.doe@iau.edu.sa', '502345678');

INSERT INTO USERS (user_id, name, email, phone_number) VALUES
(3, 'Jane Smith', 'jane.smith@iau.edu.sa', '503456789');

INSERT INTO USERS (user_id, name, email, phone_number) VALUES
(4, 'Dr. Ahmed Ali', 'ahmed.ali@iau.edu.sa', '504567890');

INSERT INTO USERS (user_id, name, email, phone_number) VALUES
(5, 'Sarah Johnson', 'sarah.johnson@iau.edu.sa', '505678901');

INSERT INTO USERS (user_id, name, email, phone_number) VALUES
(6, 'محمد عبدالله', 'mohamed.abdullah@iau.edu.sa', '506789012');

INSERT INTO USERS (user_id, name, email, phone_number) VALUES
(7, 'فاطمة أحمد', 'fatima.ahmed@iau.edu.sa', '507890123');

INSERT INTO USERS (user_id, name, email, phone_number) VALUES
(8, 'Test User', 'test@iau.edu.sa', '508901234');

-- Insert CONTACT_INFORMATION data
INSERT INTO CONTACT_INFORMATION (contact_id, department, name, email, mobile, telephone) VALUES
(1, 'Academic Planning Department', 'Dr. Sarah Wilson', 'sarah.wilson@iau.edu.sa', '501111111', '013111111');

INSERT INTO CONTACT_INFORMATION (contact_id, department, name, email, mobile, telephone) VALUES
(2, 'HR', 'Ahmed Al-Rashid', 'ahmed.rashid@iau.edu.sa', '502222222', '013222222');

INSERT INTO CONTACT_INFORMATION (contact_id, department, name, email, mobile, telephone) VALUES
(3, 'Library', 'Dr. Fatima Al-Zahra', 'fatima.zahra@iau.edu.sa', '503333333', '013333333');

INSERT INTO CONTACT_INFORMATION (contact_id, department, name, email, mobile, telephone) VALUES
(4, 'Communication and tech', 'Mohammad Bin Salman', 'mohammad.salman@iau.edu.sa', '504444444', '013444444');

INSERT INTO CONTACT_INFORMATION (contact_id, department, name, email, mobile, telephone) VALUES
(5, 'CCSIT', 'Dr. Ali Hassan', 'ali.hassan@iau.edu.sa', '505555555', '013555555');

INSERT INTO CONTACT_INFORMATION (contact_id, department, name, email, mobile, telephone) VALUES
(6, 'Students Affairs', 'Nora Al-Mansouri', 'nora.mansouri@iau.edu.sa', '506666666', '013666666');

-- Insert RECORDS data with CORRECT document types
INSERT INTO RECORDS (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(1, 1, 'Academic Program Review and Development Guide', 'Covers the process for evaluating academic programs periodically.', '3rd Edition', 'Approved by the University Council, session 45.', 'Academic Planning Department', 'guideline', DATE '2021-01-01', DATE '2015-12-28', 'students,members,program', TIMESTAMP '2025-07-23 13:17:46.825000', 'University Council');

INSERT INTO RECORDS (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(2, 1, 'Student Academic Conduct Regulation', 'Rules for student academic behavior and disciplinary procedures.', '2', 'Updated academic conduct standards.', 'HR', 'regulation', DATE '2025-07-03', DATE '2025-07-11', 'students', TIMESTAMP '2025-07-24 14:15:57.526432', 'Academic Council');

INSERT INTO RECORDS (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(3, 1, 'Library Usage Policy', 'Guidelines for proper library resource utilization.', '3', 'Updated library access policies.', 'Library', 'policy', DATE '2025-07-23', DATE '2025-07-26', 'members,program', TIMESTAMP '2025-07-24 14:21:55.113796', 'Library Committee');

INSERT INTO RECORDS (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(4, 1, 'IT Systems Usage Regulation', 'Rules for using university IT infrastructure.', '3', 'Technology usage guidelines.', 'Communication and tech', 'regulation', DATE '2025-07-23', DATE '2025-07-29', 'students,members,program', TIMESTAMP '2025-07-24 14:27:52.663137', 'IT Committee');

INSERT INTO RECORDS (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(5, 1, 'Computer Science Program Guidelines', 'Academic guidelines for CS program.', '111', 'Updated CS curriculum standards.', 'CCSIT', 'guideline', DATE '2025-07-17', DATE '2025-07-15', 'students,members', TIMESTAMP '2025-07-24 14:33:42.060067', 'CCSIT Committee');

INSERT INTO RECORDS (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(6, 1, 'Registration and Admission Policy', 'Student admission and registration procedures.', '2', 'Updated admission criteria.', 'Reg and Admission', 'policy', DATE '2025-07-03', DATE '2025-07-19', 'members', TIMESTAMP '2025-07-24 14:36:20.839296', 'Admission Committee');

INSERT INTO RECORDS (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(7, 1, 'Information Technology Security Policy', 'Cybersecurity and data protection guidelines.', '10', 'Enhanced security measures.', 'CCSIT', 'policy', DATE '2025-07-10', DATE '2025-07-10', 'students,members,program', TIMESTAMP '2025-07-24 15:59:30.053623', 'Security Committee');

INSERT INTO RECORDS (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(8, 1, 'Digital Library Access Guidelines', 'Guidelines for accessing digital resources.', '999', 'Updated digital access procedures.', 'Library', 'guideline', DATE '2025-07-18', DATE '2025-07-18', 'students,members,program', TIMESTAMP '2025-07-24 16:11:30.628408', 'Library Committee');

INSERT INTO RECORDS (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(9, 1, 'Hospital Staff Conduct Policy', 'Professional conduct standards for hospital staff.', 'G', 'Updated professional behavior guidelines.', 'Hospital', 'policy', DATE '2025-07-09', DATE '2025-07-09', 'students', TIMESTAMP '2025-07-24 16:52:37.781558', 'Medical Board');

INSERT INTO RECORDS (record_id, user_id, regulation_name, notes, version, description, department, document_type, version_date, approval_date, sections, created_at, approving_entity) VALUES
(10, 1, 'Student Affairs Regulation 2025', 'Updated student services and support regulations.', '1', 'Comprehensive student support framework.', 'CCSIT', 'regulation', DATE '2025-07-24', DATE '2025-07-24', 'students,members', TIMESTAMP '2025-07-27 10:30:00.000000', 'Student Affairs Committee');

-- Commit all changes
COMMIT;

-- ============================================================
-- 6. VERIFICATION QUERIES
-- ============================================================

-- Check that everything was created correctly
SELECT 'Tables created successfully!' AS message FROM dual;

SELECT 'USERS: ' || COUNT(*) || ' records' AS summary FROM USERS
UNION ALL
SELECT 'CONTACT_INFORMATION: ' || COUNT(*) || ' records' FROM CONTACT_INFORMATION  
UNION ALL
SELECT 'RECORDS: ' || COUNT(*) || ' records' FROM RECORDS;

-- Check document types are correct (should show regulation, policy, guideline)
SELECT 'Document Types:' AS message FROM dual;
SELECT DISTINCT DOCUMENT_TYPE, COUNT(*) as count 
FROM RECORDS 
GROUP BY DOCUMENT_TYPE 
ORDER BY DOCUMENT_TYPE;

-- ============================================================
-- INSTALLATION COMPLETE!
-- ============================================================

SELECT '==================================================' AS message FROM dual
UNION ALL
SELECT 'DATABASE EXPORT COMPLETE!' FROM dual
UNION ALL
SELECT 'Your friends can now run this script to get' FROM dual  
UNION ALL
SELECT 'the exact same working database as you!' FROM dual
UNION ALL
SELECT '==================================================' FROM dual;
