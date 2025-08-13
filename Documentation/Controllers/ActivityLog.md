# Activity Log (Admin)

## Overview
Tracks administrative and data‑change operations (create / update / delete) on core entities (Record, Contact). Provides dual‑column before/after JSON comparison with field‑level highlights and Arabic/English localization.

## Key Features
- Dual column BEFORE / AFTER view
- Field diff highlighting:
  - Yellow: modified value
  - Green: new field added
  - Red: field removed
- Legend + side‑by‑side JSON panels
- Automatic removal of deprecated `Sections` field
- Local time timestamps (replaced previous UTC display)
- Arabic localization of:
  - Field names
  - Action / entity labels
  - Entity name (uses `REGULATION_NAME_AR` or extracted from JSON)
  - Summary line (dynamic sentence: e.g. "تم تحديث السجل: …")
- Fallback parsing of Arabic name from JSON if not enriched server‑side
- No Apply button (filters auto‑apply)

## Data Model (Relevant Columns)
```
ACTIVITY_LOGS
  LOG_ID
  USER_ID
  USER_NAME
  USER_ROLE
  ACTION_TYPE        -- Create / Update / Delete
  ENTITY_TYPE        -- Record / Contact
  ENTITY_ID          -- Nullable for some actions
  ENTITY_NAME        -- English name captured at time of action
  ACTION_TIMESTAMP   -- Stored & displayed in server local time
  BEFORE_DATA        -- JSON (old schema) or OLD_VALUES (new)
  AFTER_DATA         -- JSON (old schema) or NEW_VALUES (new)
  DETAILS            -- Legacy summary (now overridden client-side)
```

## Arabic Enrichment
Server attempts enrichment:
- Adds `EntityNameAr` when available (Record: REGULATION_NAME_AR, Contact: NAME_AR)
- Adds `DetailsAr` (DescriptionAr / NotesAr / DepartmentAr) when meaningful
Client fallback (`extractArabicEntityName`):
- Parses BEFORE/AFTER JSON for keys: regulationNameAr / REGULATION_NAME_AR / NAME_AR

## Frontend Logic (activityLog.js)
Key helpers:
- `generateLocalizedSummary(actionType, entityType, entityName, isArabic)`
- `extractArabicEntityName(data)` (fallback Arabic name extraction)
- `highlightBeforeChanges` / `highlightAfterChanges`
- `translateJsonFieldNames` for dynamic key translation

## Timestamp Handling
- Previously used UTC → switched to `DateTime.Now` at logging
- Display uses `toLocaleString()` in browser respecting local timezone

## Removed / Deprecated
| Item | Status | Reason |
|------|--------|--------|
| Sections field | Removed | Column dropped from schema & diffs |
| Apply button | Removed | Filters auto fetch for better UX |
| Stored English DETAILS text | Replaced at runtime | Dynamic localized summary generation |

## Example Localized Summary
English: `Record updated: Student Disciplinary Policy`
Arabic: `تم تحديث السجل: لائحة الانضباط الطلابي`

## Error Resilience
- Tries new schema first (ACTION_TIMESTAMP/OLD_VALUES/NEW_VALUES)
- Falls back to old schema (TIMESTAMP/BEFORE_DATA/AFTER_DATA)
- Silent continuation if Arabic enrichment fails

## Future Enhancements (Optional)
- Server‑side diff precomputation
- Pagination caching
- Export with Arabic column option
- Role based redaction rules

**Last Updated**: August 13, 2025
