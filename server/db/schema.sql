-- Energo MySQL schema
-- Database name includes a dash; use backticks to reference it.
CREATE DATABASE IF NOT EXISTS `ener-go`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `ener-go`;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  password_changed_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Roles table (supports admin, audit, user)
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default roles if they don't exist
INSERT INTO roles (name, description)
  SELECT 'admin', 'Administrator' FROM (SELECT 1) AS tmp
  WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin');
INSERT INTO roles (name, description)
  SELECT 'audit', 'Audit user' FROM (SELECT 1) AS tmp
  WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'audit');
INSERT INTO roles (name, description)
  SELECT 'user', 'Regular user' FROM (SELECT 1) AS tmp
  WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'user');

-- Add role_id to existing users (nullable first, then backfill and make NOT NULL)
ALTER TABLE users
  ADD COLUMN role_id INT NULL AFTER password_changed_at;

-- Set existing users to the 'user' role by default
UPDATE users u
  JOIN (SELECT id FROM roles WHERE name = 'user' LIMIT 1) r ON 1=1
  SET u.role_id = r.id
  WHERE u.role_id IS NULL;

ALTER TABLE users
  MODIFY COLUMN role_id INT NOT NULL,
  ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Employee codes (single-use codes mapped to a role)
CREATE TABLE IF NOT EXISTS employee_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  role_id INT NOT NULL,
  used TINYINT(1) DEFAULT 0,
  used_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL,
  CONSTRAINT fk_employee_codes_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_employee_codes_used_by FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Employee code usages: separate mapping table to reference which user consumed a code.
-- This allows recording the association after the user row exists and avoids circular FK problems.
CREATE TABLE IF NOT EXISTS employee_code_usages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_code_id INT NOT NULL,
  user_id INT NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_employee_code_usages_code FOREIGN KEY (employee_code_id) REFERENCES employee_codes(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_employee_code_usages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Example seed employee codes (replace with secure values in production)
INSERT INTO employee_codes (code, role_id)
  SELECT 'ADMIN-12345', (SELECT id FROM roles WHERE name = 'admin' LIMIT 1) FROM (SELECT 1) tmp
  WHERE NOT EXISTS (SELECT 1 FROM employee_codes WHERE code = 'ADMIN-12345');
INSERT INTO employee_codes (code, role_id)
  SELECT 'AUDIT-12345', (SELECT id FROM roles WHERE name = 'audit' LIMIT 1) FROM (SELECT 1) tmp
  WHERE NOT EXISTS (SELECT 1 FROM employee_codes WHERE code = 'AUDIT-12345');

-- Energy cards table
CREATE TABLE IF NOT EXISTS energy_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  card_number VARCHAR(50) NOT NULL UNIQUE,         -- Serial format like 14416394063
  current_balance DECIMAL(10,2) DEFAULT 0,
  current_kwh DECIMAL(10,2) DEFAULT 0,
  last_recharge TIMESTAMP NULL,
  CONSTRAINT fk_energy_cards_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Recharge PINs table
CREATE TABLE IF NOT EXISTS recharge_pins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  card_number VARCHAR(50) NOT NULL,
  pin_code VARCHAR(20) NOT NULL,                   -- Pin format like 062647368815956
  amount DECIMAL(10,2) NOT NULL,
  kwh DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_recharge_pins_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_recharge_pins_card
    FOREIGN KEY (card_number) REFERENCES energy_cards(card_number)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Security logs table
CREATE TABLE IF NOT EXISTS security_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50),
  username VARCHAR(50),
  event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  details TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Application settings table (stores simple key/value configuration such as cost per kWh)
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default cost_per_kwh if not present
INSERT INTO settings (`key`, `value`)
  SELECT 'cost_per_kwh', '900' FROM (SELECT 1) AS tmp
  WHERE NOT EXISTS (SELECT 1 FROM settings WHERE `key` = 'cost_per_kwh');

-- Helpful indexes (optional but recommended)
CREATE INDEX idx_security_logs_username_time
  ON security_logs (username, event_time DESC);

CREATE INDEX idx_recharge_pins_user_time
  ON recharge_pins (user_id, created_at DESC);