-- =====================================================
-- HAIDER'S DATABASE EXPORT - Rules & Regulation System
-- Generated: July 30, 2025
-- Includes: All tables, data, and latest history feature
-- =====================================================

-- Connect as SYSTEM user to FREEPDB1
-- Usage: sqlplus system/password@localhost:1521/FREEPDB1 @haider_database_export.sql

-- =====================================================
-- 1. RECORDS TABLE (Main documents/regulations)
-- =====================================================

DROP TABLE RECORDS CASCADE CONSTRAINTS;

CREATE TABLE RECORDS (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    REGULATION_NAME VARCHAR2(500) NOT NULL,
    DESCRIPTION CLOB,
    DEPARTMENT VARCHAR2(200),
    DOCUMENT_TYPE VARCHAR2(100),
    VERSION_DATE DATE,
    CREATED_AT DATE DEFAULT SYSDATE,
    NOTES VARCHAR2(1000),
    SECTIONS VARCHAR2(500)
);

-- Sample data for RECORDS
INSERT INTO RECORDS (REGULATION_NAME, DESCRIPTION, DEPARTMENT, DOCUMENT_TYPE, VERSION_DATE, SECTIONS) 
VALUES ('Student Academic Policies', 'Complete guide for student academic regulations', 'Academic Affairs', 'Regulation', DATE '2024-01-15', 'Students');

INSERT INTO RECORDS (REGULATION_NAME, DESCRIPTION, DEPARTMENT, DOCUMENT_TYPE, VERSION_DATE, SECTIONS) 
VALUES ('Employee Handbook', 'Rules and guidelines for university employees', 'Human Resources', 'Policy', DATE '2024-02-10', 'Members');

INSERT INTO RECORDS (REGULATION_NAME, DESCRIPTION, DEPARTMENT, DOCUMENT_TYPE, VERSION_DATE, SECTIONS) 
VALUES ('Library Usage Guidelines', 'How to use university library resources', 'Library', 'Guidelines', DATE '2024-03-05', 'Students');

INSERT INTO RECORDS (REGULATION_NAME, DESCRIPTION, DEPARTMENT, DOCUMENT_TYPE, VERSION_DATE, SECTIONS) 
VALUES ('Research Ethics Policy', 'Guidelines for ethical research conduct', 'Research Office', 'Policy', DATE '2024-01-20', 'Enrolled Programs');

INSERT INTO RECORDS (REGULATION_NAME, DESCRIPTION, DEPARTMENT, DOCUMENT_TYPE, VERSION_DATE, SECTIONS) 
VALUES ('jalil', 'Test document for development', 'CCSIT', 'Guidelines', DATE '2024-06-01', 'Students');

-- =====================================================
-- 2. USER_HISTORY TABLE (Activity tracking)
-- =====================================================

DROP TABLE USER_HISTORY CASCADE CONSTRAINTS;

CREATE TABLE USER_HISTORY (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID VARCHAR2(100) DEFAULT '1',
    RECORD_ID NUMBER NOT NULL,
    ACTION VARCHAR2(50) NOT NULL,
    ACTION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_record FOREIGN KEY (RECORD_ID) REFERENCES RECORDS(ID)
);

-- Sample history data
INSERT INTO USER_HISTORY (USER_ID, RECORD_ID, ACTION, ACTION_DATE) 
VALUES ('1', 5, 'view', TIMESTAMP '2025-07-30 16:35:55.654');

INSERT INTO USER_HISTORY (USER_ID, RECORD_ID, ACTION, ACTION_DATE) 
VALUES ('1', 1, 'download', TIMESTAMP '2025-07-30 17:20:30.123');

INSERT INTO USER_HISTORY (USER_ID, RECORD_ID, ACTION, ACTION_DATE) 
VALUES ('1', 3, 'chatbot', TIMESTAMP '2025-07-30 18:15:45.789');

-- =====================================================
-- 3. SAVED_RECORDS TABLE (User bookmarks)
-- =====================================================

DROP TABLE SAVED_RECORDS CASCADE CONSTRAINTS;

CREATE TABLE SAVED_RECORDS (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID VARCHAR2(100) NOT NULL,
    RECORD_ID NUMBER NOT NULL,
    SAVED_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_record FOREIGN KEY (RECORD_ID) REFERENCES RECORDS(ID),
    CONSTRAINT uk_user_record UNIQUE (USER_ID, RECORD_ID)
);

-- Sample saved records
INSERT INTO SAVED_RECORDS (USER_ID, RECORD_ID) VALUES ('1', 1);
INSERT INTO SAVED_RECORDS (USER_ID, RECORD_ID) VALUES ('1', 3);

-- =====================================================
-- 4. ATTACHMENT TABLE (PDF files)
-- =====================================================

DROP TABLE ATTACHMENT CASCADE CONSTRAINTS;

CREATE TABLE ATTACHMENT (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ADDNEWRECORDID NUMBER NOT NULL,
    FILETYPE VARCHAR2(100),
    FILEPATH VARCHAR2(500),
    UPLOADDATE DATE DEFAULT SYSDATE,
    CONSTRAINT fk_attachment_record FOREIGN KEY (ADDNEWRECORDID) REFERENCES RECORDS(ID)
);

-- Sample attachments
INSERT INTO ATTACHMENT (ADDNEWRECORDID, FILETYPE, FILEPATH) 
VALUES (1, 'application/pdf', '/uploads/student_academic_policies.pdf');

INSERT INTO ATTACHMENT (ADDNEWRECORDID, FILETYPE, FILEPATH) 
VALUES (2, 'application/pdf', '/uploads/employee_handbook.pdf');

INSERT INTO ATTACHMENT (ADDNEWRECORDID, FILETYPE, FILEPATH) 
VALUES (5, 'application/pdf', '/uploads/jalil_document.pdf');

-- =====================================================
-- 5. CONTACT_INFORMATION TABLE (Contact details)
-- =====================================================

DROP TABLE CONTACT_INFORMATION CASCADE CONSTRAINTS;

CREATE TABLE CONTACT_INFORMATION (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    NAME VARCHAR2(200) NOT NULL,
    POSITION VARCHAR2(200),
    DEPARTMENT VARCHAR2(200),
    EMAIL VARCHAR2(200),
    PHONE VARCHAR2(50),
    OFFICE_LOCATION VARCHAR2(200),
    CREATED_AT DATE DEFAULT SYSDATE
);

-- Sample contact information
INSERT INTO CONTACT_INFORMATION (NAME, POSITION, DEPARTMENT, EMAIL, PHONE, OFFICE_LOCATION) 
VALUES ('Dr. Ahmed Ali', 'Dean', 'Academic Affairs', 'ahmed.ali@university.edu', '+966-11-1234567', 'Building A, Room 101');

INSERT INTO CONTACT_INFORMATION (NAME, POSITION, DEPARTMENT, EMAIL, PHONE, OFFICE_LOCATION) 
VALUES ('Sarah Mohammed', 'Student Services Manager', 'Student Affairs', 'sarah.mohammed@university.edu', '+966-11-1234568', 'Building B, Room 205');

-- =====================================================
-- 6. ADDITIONAL TABLES (if needed)
-- =====================================================

-- ADMIN table (if you have admin users)
DROP TABLE ADMIN CASCADE CONSTRAINTS;

CREATE TABLE ADMIN (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USERNAME VARCHAR2(100) UNIQUE NOT NULL,
    PASSWORD_HASH VARCHAR2(500) NOT NULL,
    EMAIL VARCHAR2(200),
    CREATED_AT DATE DEFAULT SYSDATE,
    LAST_LOGIN DATE
);

-- Sample admin user (password: 'admin123' - change this!)
INSERT INTO ADMIN (USERNAME, PASSWORD_HASH, EMAIL) 
VALUES ('admin', 'hashed_password_here', 'admin@university.edu');

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- Performance indexes
CREATE INDEX idx_records_department ON RECORDS(DEPARTMENT);
CREATE INDEX idx_records_type ON RECORDS(DOCUMENT_TYPE);
CREATE INDEX idx_records_sections ON RECORDS(SECTIONS);
CREATE INDEX idx_user_history_user ON USER_HISTORY(USER_ID);
CREATE INDEX idx_user_history_record ON USER_HISTORY(RECORD_ID);
CREATE INDEX idx_user_history_action ON USER_HISTORY(ACTION);
CREATE INDEX idx_saved_records_user ON SAVED_RECORDS(USER_ID);
CREATE INDEX idx_attachment_record ON ATTACHMENT(ADDNEWRECORDID);

-- =====================================================
-- 8. SEQUENCES (Oracle auto-generates with IDENTITY)
-- =====================================================

-- Sequences are automatically created with GENERATED ALWAYS AS IDENTITY
-- No manual sequence creation needed

-- =====================================================
-- 9. GRANTS AND PERMISSIONS
-- =====================================================

-- Grant permissions to your application user if different from SYSTEM
-- GRANT SELECT, INSERT, UPDATE, DELETE ON RECORDS TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON USER_HISTORY TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON SAVED_RECORDS TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ATTACHMENT TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON CONTACT_INFORMATION TO your_app_user;

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Run these to verify everything was created correctly:

-- Check all tables exist
SELECT table_name FROM user_tables ORDER BY table_name;

-- Check record count
SELECT 'RECORDS' as table_name, COUNT(*) as count FROM RECORDS
UNION ALL
SELECT 'USER_HISTORY', COUNT(*) FROM USER_HISTORY
UNION ALL
SELECT 'SAVED_RECORDS', COUNT(*) FROM SAVED_RECORDS
UNION ALL
SELECT 'ATTACHMENT', COUNT(*) FROM ATTACHMENT
UNION ALL
SELECT 'CONTACT_INFORMATION', COUNT(*) FROM CONTACT_INFORMATION;

-- Test the history feature
SELECT r.REGULATION_NAME, h.ACTION, h.ACTION_DATE 
FROM USER_HISTORY h
JOIN RECORDS r ON h.RECORD_ID = r.ID
ORDER BY h.ACTION_DATE DESC;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

COMMIT;

PROMPT '=================================='
PROMPT 'Database export completed for Haider!'
PROMPT 'All tables created with sample data.'
PROMPT 'Ready to run the Rules & Regulation System.'
PROMPT '=================================='
