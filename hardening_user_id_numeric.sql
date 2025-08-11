-- ============================================================
-- Hardening USER_ID to be numeric and generated only
-- Date: 2025-08-11
-- This script standardizes USER_ID as NUMBER and enforces FK
-- It also adds a trigger to generate USERS.USER_ID from USERS_SEQ
-- and fixes existing ACTIVITY_LOGS rows to use numeric USER_ID.
--
-- Safe to re-run; guards attempt to avoid breaking on existing objects.
-- ============================================================

-- 0) Ensure USERS sequence exists (adjust START WITH as needed)
DECLARE
  v_cnt NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_cnt FROM user_sequences WHERE sequence_name = 'USERS_SEQ';
  IF v_cnt = 0 THEN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE USERS_SEQ START WITH 1 INCREMENT BY 1 MINVALUE 1';
  END IF;
END;
/

-- 1) Create or replace trigger to auto-generate USERS.USER_ID if null
CREATE OR REPLACE TRIGGER USERS_BI
BEFORE INSERT ON USERS
FOR EACH ROW
WHEN (NEW.USER_ID IS NULL)
BEGIN
  SELECT USERS_SEQ.NEXTVAL INTO :NEW.USER_ID FROM DUAL;
END;
/

-- 2) Migrate ACTIVITY_LOGS.USER_ID to NUMBER if it is VARCHAR2
--    We copy into a temp numeric column then swap
DECLARE
  v_coltype VARCHAR2(128);
BEGIN
  SELECT data_type INTO v_coltype
  FROM user_tab_columns
  WHERE table_name = 'ACTIVITY_LOGS' AND column_name = 'USER_ID';

  IF v_coltype <> 'NUMBER' THEN
    BEGIN
      EXECUTE IMMEDIATE 'ALTER TABLE ACTIVITY_LOGS ADD (USER_ID_NUM NUMBER)';
    EXCEPTION WHEN OTHERS THEN NULL; -- column may already exist
    END;

    -- Populate numeric value: prefer direct numeric, else map by user name
    EXECUTE IMMEDIATE q'[UPDATE ACTIVITY_LOGS a
      SET USER_ID_NUM = CASE
        WHEN REGEXP_LIKE(a.USER_ID, '^[0-9]+$') THEN TO_NUMBER(a.USER_ID)
        ELSE (
          SELECT u.USER_ID FROM USERS u
          WHERE UPPER(NVL(u.NAME, '')) = UPPER(NVL(a.USER_NAME, ''))
          FETCH FIRST 1 ROWS ONLY
        )
      END
      WHERE USER_ID_NUM IS NULL]';

    -- Swap columns
    EXECUTE IMMEDIATE 'ALTER TABLE ACTIVITY_LOGS DROP COLUMN USER_ID';
    EXECUTE IMMEDIATE 'ALTER TABLE ACTIVITY_LOGS RENAME COLUMN USER_ID_NUM TO USER_ID';
  END IF;
END;
/

-- 3) Add FK from ACTIVITY_LOGS.USER_ID to USERS.USER_ID (if not exists)
DECLARE
  v_cnt NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_cnt
  FROM user_constraints
  WHERE table_name = 'ACTIVITY_LOGS' AND constraint_type = 'R' AND constraint_name = 'FK_ACTIVITY_LOGS_USERS';
  IF v_cnt = 0 THEN
    BEGIN
      EXECUTE IMMEDIATE 'ALTER TABLE ACTIVITY_LOGS ADD CONSTRAINT FK_ACTIVITY_LOGS_USERS FOREIGN KEY (USER_ID) REFERENCES USERS(USER_ID)';
    EXCEPTION WHEN OTHERS THEN NULL; -- skip if data prevents FK; fix data then re-run
    END;
  END IF;
END;
/

-- 4) Optional: add index for performance
BEGIN
  EXECUTE IMMEDIATE 'CREATE INDEX IDX_ACTIVITY_LOGS_USER_ID ON ACTIVITY_LOGS(USER_ID)';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

-- 5) Verify
SET SERVEROUTPUT ON
DECLARE
  v_type VARCHAR2(128);
  v_fk   NUMBER;
BEGIN
  SELECT data_type INTO v_type FROM user_tab_columns WHERE table_name = 'ACTIVITY_LOGS' AND column_name = 'USER_ID';
  SELECT COUNT(*) INTO v_fk FROM user_constraints WHERE table_name = 'ACTIVITY_LOGS' AND constraint_name = 'FK_ACTIVITY_LOGS_USERS';
  DBMS_OUTPUT.PUT_LINE('ACTIVITY_LOGS.USER_ID type: ' || v_type);
  DBMS_OUTPUT.PUT_LINE('FK_ACTIVITY_LOGS_USERS present: ' || v_fk);
END;
/

-- Done
