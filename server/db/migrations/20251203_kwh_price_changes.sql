-- Energo DB migration: kWh price tracking, default price seed, and admin change procedure
-- MySQL 8.x
-- Creates history table, seeds default 861.88 COP if missing, and adds a stored procedure
-- to update the price while writing to both kwh_price_history and security_logs.

START TRANSACTION;

-- 1) History table for all kWh price changes linked to the admin user who made the change
CREATE TABLE IF NOT EXISTS kwh_price_history (
  id INT NOT NULL AUTO_INCREMENT,
  admin_user_id INT NOT NULL,
  price_cop DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_kwh_price_history_admin (admin_user_id),
  CONSTRAINT fk_kwh_price_history_admin
    FOREIGN KEY (admin_user_id) REFERENCES users(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2) Seed default price only if missing (861.88 COP)
INSERT INTO settings (`key`, `value`, `created_at`, `updated_at`)
SELECT 'cost_per_kwh', '861.88', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE `key` = 'cost_per_kwh');

-- 3) Stored procedure to set kWh price, recording both history and security logs
DROP PROCEDURE IF EXISTS sp_set_kwh_price;
DELIMITER $$
CREATE PROCEDURE sp_set_kwh_price(IN p_admin_user_id INT, IN p_price DECIMAL(10,2))
BEGIN
  DECLARE v_old_price DECIMAL(10,2);
  DECLARE v_username VARCHAR(50);

  -- Normalize incoming price
  SET p_price = ROUND(p_price, 2);

  -- Fetch admin username (for security_logs.username)
  SELECT u.username INTO v_username
  FROM users u
  WHERE u.id = p_admin_user_id
  LIMIT 1;

  -- Attempt to lock current settings row and get the old price
  SELECT CAST(s.value AS DECIMAL(10,2)) INTO v_old_price
  FROM settings s
  WHERE s.`key` = 'cost_per_kwh'
  FOR UPDATE;

  -- Fallback if the key didn't exist
  IF v_old_price IS NULL THEN
    SET v_old_price = 861.88;
  END IF;

  -- Upsert new price into settings
  INSERT INTO settings (`key`, `value`, `created_at`, `updated_at`)
  VALUES ('cost_per_kwh', CAST(p_price AS CHAR), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  ON DUPLICATE KEY UPDATE
    `value` = VALUES(`value`),
    `updated_at` = CURRENT_TIMESTAMP;

  -- Insert into dedicated price history table
  INSERT INTO kwh_price_history (admin_user_id, price_cop)
  VALUES (p_admin_user_id, p_price);

  -- Log into existing security_logs, mirroring style used elsewhere
  INSERT INTO security_logs (event_type, username, ip_address, details)
  VALUES (
    'kwh_price_update',
    v_username,
    NULL,
    JSON_OBJECT('old', v_old_price, 'new', p_price)
  );
END$$
DELIMITER ;

COMMIT;

-- Usage (examples):
-- CALL sp_set_kwh_price(3, 861.88);   -- where 3 is the admin user id
-- CALL sp_set_kwh_price(3, 900.00);   -- update to a new price