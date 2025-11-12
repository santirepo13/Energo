-- Seed employee codes: 3 admin, 3 audit (10-char random)
-- These codes are single-use. Run this file against your database after the schema is applied.
INSERT INTO employee_codes (code, role_id)
  SELECT 'X7G4Q9M2BZ', (SELECT id FROM roles WHERE name = 'admin' LIMIT 1) FROM (SELECT 1) tmp
  WHERE NOT EXISTS (SELECT 1 FROM employee_codes WHERE code = 'X7G4Q9M2BZ');

INSERT INTO employee_codes (code, role_id)
  SELECT 'N5R8K1V0YC', (SELECT id FROM roles WHERE name = 'admin' LIMIT 1) FROM (SELECT 1) tmp
  WHERE NOT EXISTS (SELECT 1 FROM employee_codes WHERE code = 'N5R8K1V0YC');

INSERT INTO employee_codes (code, role_id)
  SELECT 'P3H6T2L9DS', (SELECT id FROM roles WHERE name = 'admin' LIMIT 1) FROM (SELECT 1) tmp
  WHERE NOT EXISTS (SELECT 1 FROM employee_codes WHERE code = 'P3H6T2L9DS');

INSERT INTO employee_codes (code, role_id)
  SELECT 'U2Z7C5Q8WF', (SELECT id FROM roles WHERE name = 'audit' LIMIT 1) FROM (SELECT 1) tmp
  WHERE NOT EXISTS (SELECT 1 FROM employee_codes WHERE code = 'U2Z7C5Q8WF');

INSERT INTO employee_codes (code, role_id)
  SELECT 'M9L1S4B6KR', (SELECT id FROM roles WHERE name = 'audit' LIMIT 1) FROM (SELECT 1) tmp
  WHERE NOT EXISTS (SELECT 1 FROM employee_codes WHERE code = 'M9L1S4B6KR');

INSERT INTO employee_codes (code, role_id)
  SELECT 'T0V3J8N5PX', (SELECT id FROM roles WHERE name = 'audit' LIMIT 1) FROM (SELECT 1) tmp
  WHERE NOT EXISTS (SELECT 1 FROM employee_codes WHERE code = 'T0V3J8N5PX');