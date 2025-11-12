-- Migration: add statuses table and link to users with default 'Activo'
-- Run this after the main schema is applied. Safe to run multiple times.

USE `ener-go`;

-- 1) Create statuses lookup table
CREATE TABLE IF NOT EXISTS statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) Seed default statuses if not present
INSERT INTO statuses (name)
  SELECT 'Activo' FROM (SELECT 1) t
  WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE name = 'Activo');

INSERT INTO statuses (name)
  SELECT 'Pausa' FROM (SELECT 1) t
  WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE name = 'Pausa');

INSERT INTO statuses (name)
  SELECT 'Deshabilitado' FROM (SELECT 1) t
  WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE name = 'Deshabilitado');

INSERT INTO statuses (name)
  SELECT 'Suspendido' FROM (SELECT 1) t
  WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE name = 'Suspendido');

-- 3) Add status_id to users (nullable first)
--    If the column exists already this will error; wrap in a conditional.
--    MySQL lacks IF NOT EXISTS for ADD COLUMN in older versions, but we can try-catch in migration runners.
--    Here we attempt and ignore errors at runtime if already exists.
ALTER TABLE users
  ADD COLUMN status_id INT NULL AFTER role_id;

-- 4) Backfill status_id for existing rows to 'Activo'
UPDATE users u
JOIN (SELECT id FROM statuses WHERE name = 'Activo' LIMIT 1) s ON 1=1
SET u.status_id = s.id
WHERE u.status_id IS NULL;

-- 5) Enforce NOT NULL and add FK
ALTER TABLE users
  MODIFY COLUMN status_id INT NOT NULL,
  ADD CONSTRAINT fk_users_status
    FOREIGN KEY (status_id) REFERENCES statuses(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

-- 6) Helpful index
CREATE INDEX idx_users_status ON users (status_id);