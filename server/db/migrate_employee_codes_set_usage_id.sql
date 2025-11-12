-- Migration: replace employee_codes.used_by with employee_codes.employee_usage_id (references employee_code_usages.id)
-- Run this after the main schema and the employee_code_usages table exist.

SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS=0;

-- Drop the old FK (created earlier as fk_employee_codes_used_by)
ALTER TABLE employee_codes DROP FOREIGN KEY fk_employee_codes_used_by;

-- Drop the used_by column
ALTER TABLE employee_codes DROP COLUMN used_by;

-- Add employee_usage_id column that points to the mapping table row
ALTER TABLE employee_codes ADD COLUMN employee_usage_id INT NULL AFTER used;

-- Add FK to employee_code_usages so the employee_codes row can reference the usage record
ALTER TABLE employee_codes
  ADD CONSTRAINT fk_employee_codes_usage
  FOREIGN KEY (employee_usage_id) REFERENCES employee_code_usages(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;

-- Note: this migration does not attempt to backfill existing values; if you have previous used_by values
-- you may need to create corresponding rows in employee_code_usages and update employee_codes.employee_usage_id accordingly.