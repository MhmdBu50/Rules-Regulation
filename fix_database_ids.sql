-- ============================================================
-- Fix Database IDs - Reset to Start from 1
-- Generated: July 27, 2025
-- This script fixes all the messed up IDs in the database
-- ============================================================

-- Disable foreign key constraints temporarily
ALTER TABLE records DISABLE CONSTRAINT fk_records_user;
ALTER TABLE attachments DISABLE CONSTRAINT fk_attach_record;

-- ============================================================
-- 1. Fix USERS table - Renumber IDs starting from 1
-- ============================================================

-- Create a temporary table to store the mapping
CREATE TABLE temp_user_mapping (
    old_user_id NUMBER,
    new_user_id NUMBER
);

-- Insert mapping data (old_id -> new_id)
INSERT INTO temp_user_mapping (old_user_id, new_user_id)
SELECT user_id as old_user_id, ROWNUM as new_user_id
FROM (SELECT user_id FROM users ORDER BY user_id);

-- Update the users table with new IDs
UPDATE users 
SET user_id = (
    SELECT new_user_id 
    FROM temp_user_mapping 
    WHERE temp_user_mapping.old_user_id = users.user_id
);

-- Update foreign key references in records table
UPDATE records 
SET user_id = (
    SELECT new_user_id 
    FROM temp_user_mapping 
    WHERE temp_user_mapping.old_user_id = records.user_id
);

-- Drop temporary mapping table
DROP TABLE temp_user_mapping;

-- Reset users sequence to start after the last ID
DROP SEQUENCE users_seq;
CREATE SEQUENCE users_seq
START WITH 9
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

-- ============================================================
-- 2. Fix CONTACT_INFORMATION table - Renumber IDs starting from 1
-- ============================================================

-- Create temporary table for contact mapping
CREATE TABLE temp_contact_mapping (
    old_contact_id NUMBER,
    new_contact_id NUMBER
);

-- Insert mapping data
INSERT INTO temp_contact_mapping (old_contact_id, new_contact_id)
SELECT contact_id as old_contact_id, ROWNUM as new_contact_id
FROM (SELECT contact_id FROM contact_information ORDER BY contact_id);

-- Update contact_information table with new IDs
UPDATE contact_information 
SET contact_id = (
    SELECT new_contact_id 
    FROM temp_contact_mapping 
    WHERE temp_contact_mapping.old_contact_id = contact_information.contact_id
);

-- Drop temporary mapping table
DROP TABLE temp_contact_mapping;

-- Reset contact_info sequence to start after the last ID
DROP SEQUENCE contact_info_seq;
CREATE SEQUENCE contact_info_seq
START WITH 7
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

-- ============================================================
-- 3. Fix RECORDS table - Renumber IDs starting from 1
-- ============================================================

-- Create temporary table for records mapping
CREATE TABLE temp_record_mapping (
    old_record_id NUMBER,
    new_record_id NUMBER
);

-- Insert mapping data
INSERT INTO temp_record_mapping (old_record_id, new_record_id)
SELECT record_id as old_record_id, ROWNUM as new_record_id
FROM (SELECT record_id FROM records ORDER BY record_id);

-- Update records table with new IDs
UPDATE records 
SET record_id = (
    SELECT new_record_id 
    FROM temp_record_mapping 
    WHERE temp_record_mapping.old_record_id = records.record_id
);

-- Update foreign key references in attachments table (if any exist)
UPDATE attachments 
SET record_id = (
    SELECT new_record_id 
    FROM temp_record_mapping 
    WHERE temp_record_mapping.old_record_id = attachments.record_id
)
WHERE EXISTS (
    SELECT 1 FROM temp_record_mapping 
    WHERE temp_record_mapping.old_record_id = attachments.record_id
);

-- Drop temporary mapping table
DROP TABLE temp_record_mapping;

-- Reset records sequence to start after the last ID
DROP SEQUENCE records_seq;
CREATE SEQUENCE records_seq
START WITH 11
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

-- ============================================================
-- 4. Fix ATTACHMENTS table (already starts from 1, but ensure sequence is correct)
-- ============================================================

-- Attachments table is empty, so just ensure sequence starts from 1
DROP SEQUENCE attachments_seq;
CREATE SEQUENCE attachments_seq
START WITH 1
INCREMENT BY 1
MINVALUE 1
MAXVALUE 9999999999999999999999999999;

-- ============================================================
-- 5. Re-enable foreign key constraints
-- ============================================================

ALTER TABLE records ENABLE CONSTRAINT fk_records_user;
ALTER TABLE attachments ENABLE CONSTRAINT fk_attach_record;

-- ============================================================
-- 6. Verify the fix
-- ============================================================

-- Check the new ID ranges
SELECT 'USERS' as table_name, MIN(user_id) as min_id, MAX(user_id) as max_id, COUNT(*) as total_rows FROM users
UNION ALL
SELECT 'CONTACT_INFORMATION' as table_name, MIN(contact_id) as min_id, MAX(contact_id) as max_id, COUNT(*) as total_rows FROM contact_information
UNION ALL
SELECT 'RECORDS' as table_name, MIN(record_id) as min_id, MAX(record_id) as max_id, COUNT(*) as total_rows FROM records;

-- Check sequence values
SELECT sequence_name, last_number as current_value
FROM user_sequences 
WHERE sequence_name IN ('USERS_SEQ', 'CONTACT_INFO_SEQ', 'RECORDS_SEQ', 'ATTACHMENTS_SEQ')
ORDER BY sequence_name;

-- Commit all changes
COMMIT;

SELECT 'Database ID fix completed successfully!' AS message FROM dual;
SELECT 'All IDs now start from 1 and sequences are properly aligned!' AS message FROM dual;
