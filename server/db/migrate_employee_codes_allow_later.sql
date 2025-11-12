-- Migration: ensure employee_codes.used_by can be assigned after the code is created
-- Run this against your DB after applying the main schema if needed.

-- Make used_by explicitly nullable with a default of NULL (safe no-op if already set)
ALTER TABLE employee_codes
  MODIFY COLUMN used_by INT NULL DEFAULT NULL;

-- (Optional) If you prefer to remove the foreign key constraint so codes can reference user ids later
-- uncomment the DROP and ADD statements below. The current schema uses:
-- CONSTRAINT fk_employee_codes_used_by FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
-- which already allows used_by to be NULL and updated later once the user exists.

-- Example to drop and recreate without FK (uncomment to use):
-- ALTER TABLE employee_codes DROP FOREIGN KEY fk_employee_codes_used_by;
-- ALTER TABLE employee_codes ADD COLUMN used_by INT NULL DEFAULT NULL;