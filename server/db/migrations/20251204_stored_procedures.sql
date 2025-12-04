-- 2025-12-04: Stored procedures for Energo (MariaDB 10.x compatible; avoids MySQL 8-only features)
-- Moves all inline SQL from app code into callable routines. Safe to re-run.

DELIMITER $$

-- Security logs
DROP PROCEDURE IF EXISTS sp_security_logs_insert $$
CREATE PROCEDURE sp_security_logs_insert(
  IN p_event_type VARCHAR(50),
  IN p_username   VARCHAR(50),
  IN p_ip         VARCHAR(45),
  IN p_details    TEXT
)
BEGIN
  INSERT INTO security_logs (event_type, username, ip_address, details)
  VALUES (p_event_type, p_username, p_ip, p_details);
  SELECT LAST_INSERT_ID() AS inserted_id;
END $$

DROP PROCEDURE IF EXISTS sp_security_logs_latest $$
CREATE PROCEDURE sp_security_logs_latest(IN p_limit INT)
BEGIN
  IF p_limit IS NULL OR p_limit <= 0 THEN SET p_limit = 200; END IF;
  SELECT event_type, event_time, ip_address, details
  FROM security_logs
  ORDER BY event_time DESC
  LIMIT p_limit;
END $$

-- Settings (key-value)
DROP PROCEDURE IF EXISTS sp_settings_get $$
CREATE PROCEDURE sp_settings_get(IN p_key VARCHAR(100))
BEGIN
  SELECT `value` FROM settings WHERE `key` = p_key LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_settings_upsert_cost_per_kwh $$
CREATE PROCEDURE sp_settings_upsert_cost_per_kwh(IN p_value VARCHAR(255))
BEGIN
  INSERT INTO settings (`key`,`value`,`created_at`,`updated_at`)
  VALUES ('cost_per_kwh', p_value, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  ON DUPLICATE KEY UPDATE
    `value` = VALUES(`value`),
    `updated_at` = CURRENT_TIMESTAMP;
END $$

-- Users
DROP PROCEDURE IF EXISTS sp_users_find_by_username_or_email $$
CREATE PROCEDURE sp_users_find_by_username_or_email(IN p_username VARCHAR(50), IN p_email VARCHAR(100))
BEGIN
  SELECT id FROM users WHERE username = p_username OR email = p_email LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_users_insert $$
CREATE PROCEDURE sp_users_insert(
  IN p_username VARCHAR(50),
  IN p_password_hash VARCHAR(255),
  IN p_email VARCHAR(100),
  IN p_role_id INT,
  IN p_status_id INT
)
BEGIN
  INSERT INTO users (username, password_hash, email, role_id, status_id)
  VALUES (p_username, p_password_hash, p_email, p_role_id, p_status_id);
  SELECT LAST_INSERT_ID() AS inserted_id;
END $$

DROP PROCEDURE IF EXISTS sp_users_select_login_by_username $$
CREATE PROCEDURE sp_users_select_login_by_username(IN p_username VARCHAR(50))
BEGIN
  SELECT u.id, u.password_hash, r.name AS role_name, s.name AS status_name
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  LEFT JOIN statuses s ON s.id = u.status_id
  WHERE u.username = p_username
  LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_users_update_last_login $$
CREATE PROCEDURE sp_users_update_last_login(IN p_user_id INT)
BEGIN
  UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = p_user_id;
  SELECT ROW_COUNT() AS affected_rows;
END $$

DROP PROCEDURE IF EXISTS sp_users_select_role_status_by_id $$
CREATE PROCEDURE sp_users_select_role_status_by_id(IN p_user_id INT)
BEGIN
  SELECT r.name AS role_name, s.name AS status_name
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  LEFT JOIN statuses s ON s.id = u.status_id
  WHERE u.id = p_user_id
  LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_users_get_basic_by_id $$
CREATE PROCEDURE sp_users_get_basic_by_id(IN p_user_id INT)
BEGIN
  SELECT username, email FROM users WHERE id = p_user_id LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_users_get_password_hash $$
CREATE PROCEDURE sp_users_get_password_hash(IN p_user_id INT)
BEGIN
  SELECT username, email, password_hash FROM users WHERE id = p_user_id LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_users_update_password $$
CREATE PROCEDURE sp_users_update_password(IN p_user_id INT, IN p_hash VARCHAR(255))
BEGIN
  UPDATE users SET password_hash = p_hash, password_changed_at = CURRENT_TIMESTAMP WHERE id = p_user_id;
  SELECT ROW_COUNT() AS affected_rows;
END $$

DROP PROCEDURE IF EXISTS sp_users_update_status_by_name $$
CREATE PROCEDURE sp_users_update_status_by_name(IN p_user_id INT, IN p_status_name VARCHAR(50))
BEGIN
  DECLARE v_status_id INT DEFAULT NULL;
  SELECT id INTO v_status_id FROM statuses WHERE name = p_status_name LIMIT 1;
  IF v_status_id IS NULL THEN
    SELECT 0 AS affected_rows, 'STATUS_NOT_FOUND' AS error_code;
  ELSE
    UPDATE users SET status_id = v_status_id WHERE id = p_user_id;
    SELECT ROW_COUNT() AS affected_rows, NULL AS error_code;
  END IF;
END $$

DROP PROCEDURE IF EXISTS sp_users_email_exists_other $$
CREATE PROCEDURE sp_users_email_exists_other(IN p_email VARCHAR(100), IN p_exclude_id INT)
BEGIN
  SELECT id FROM users WHERE email = p_email AND id <> p_exclude_id LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_users_update_email $$
CREATE PROCEDURE sp_users_update_email(IN p_user_id INT, IN p_email VARCHAR(100))
BEGIN
  UPDATE users SET email = p_email WHERE id = p_user_id;
  SELECT ROW_COUNT() AS affected_rows;
END $$

-- Roles and Statuses
DROP PROCEDURE IF EXISTS sp_roles_get_id_by_name $$
CREATE PROCEDURE sp_roles_get_id_by_name(IN p_name VARCHAR(50))
BEGIN
  SELECT id FROM roles WHERE name = p_name LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_statuses_get_id_by_name $$
CREATE PROCEDURE sp_statuses_get_id_by_name(IN p_name VARCHAR(50))
BEGIN
  SELECT id FROM statuses WHERE name = p_name LIMIT 1;
END $$

-- Employee codes
DROP PROCEDURE IF EXISTS sp_employee_codes_get_for_update $$
CREATE PROCEDURE sp_employee_codes_get_for_update(IN p_code VARCHAR(100))
BEGIN
  SELECT id, role_id, used FROM employee_codes WHERE code = p_code LIMIT 1 FOR UPDATE;
END $$

DROP PROCEDURE IF EXISTS sp_employee_code_usages_insert $$
CREATE PROCEDURE sp_employee_code_usages_insert(IN p_employee_code_id INT, IN p_user_id INT)
BEGIN
  INSERT INTO employee_code_usages (employee_code_id, user_id) VALUES (p_employee_code_id, p_user_id);
  SELECT LAST_INSERT_ID() AS inserted_id;
END $$

DROP PROCEDURE IF EXISTS sp_employee_codes_mark_used $$
CREATE PROCEDURE sp_employee_codes_mark_used(IN p_id INT, IN p_usage_id INT)
BEGIN
  UPDATE employee_codes
  SET used = 1, used_at = CURRENT_TIMESTAMP, employee_usage_id = p_usage_id
  WHERE id = p_id;
  SELECT ROW_COUNT() AS affected_rows;
END $$

DROP PROCEDURE IF EXISTS sp_employee_codes_list $$
CREATE PROCEDURE sp_employee_codes_list()
BEGIN
  SELECT
    ec.id,
    ec.code,
    ec.used,
    ec.created_at,
    ec.used_at,
    r.name AS role,
    u.username AS used_by_username
  FROM employee_codes ec
  LEFT JOIN roles r ON r.id = ec.role_id
  LEFT JOIN employee_code_usages ecu ON ecu.id = ec.employee_usage_id
  LEFT JOIN users u ON u.id = ecu.user_id
  ORDER BY ec.created_at DESC;
END $$

DROP PROCEDURE IF EXISTS sp_employee_codes_insert $$
CREATE PROCEDURE sp_employee_codes_insert(IN p_code VARCHAR(100), IN p_role_id INT)
BEGIN
  INSERT INTO employee_codes (code, role_id, used) VALUES (p_code, p_role_id, 0);
  SELECT LAST_INSERT_ID() AS inserted_id;
END $$

-- Energy cards (meters)
DROP PROCEDURE IF EXISTS sp_energy_cards_find_by_card_number $$
CREATE PROCEDURE sp_energy_cards_find_by_card_number(IN p_card_number VARCHAR(50))
BEGIN
  SELECT id, user_id, card_number, name, current_balance, current_kwh, last_recharge, released, released_by_user_id, released_at
  FROM energy_cards
  WHERE card_number = p_card_number
  LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_energy_cards_select_by_user_and_card_for_update $$
CREATE PROCEDURE sp_energy_cards_select_by_user_and_card_for_update(IN p_user_id INT, IN p_card_number VARCHAR(50))
BEGIN
  SELECT card_number, current_balance, current_kwh
  FROM energy_cards
  WHERE user_id = p_user_id AND card_number = p_card_number
  LIMIT 1 FOR UPDATE;
END $$

DROP PROCEDURE IF EXISTS sp_energy_cards_select_one_by_user_for_update $$
CREATE PROCEDURE sp_energy_cards_select_one_by_user_for_update(IN p_user_id INT)
BEGIN
  SELECT card_number, current_balance, current_kwh
  FROM energy_cards
  WHERE user_id = p_user_id
  FOR UPDATE;
END $$

DROP PROCEDURE IF EXISTS sp_energy_cards_update_balance $$
CREATE PROCEDURE sp_energy_cards_update_balance(
  IN p_user_id INT,
  IN p_card_number VARCHAR(50),
  IN p_new_balance DECIMAL(10,2),
  IN p_new_kwh DECIMAL(10,2)
)
BEGIN
  UPDATE energy_cards
  SET current_balance = p_new_balance,
      current_kwh    = p_new_kwh,
      last_recharge  = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id AND card_number = p_card_number;
  SELECT ROW_COUNT() AS affected_rows;
END $$

DROP PROCEDURE IF EXISTS sp_recharge_pins_insert $$
CREATE PROCEDURE sp_recharge_pins_insert(
  IN p_user_id INT,
  IN p_card_number VARCHAR(50),
  IN p_pin_code VARCHAR(20),
  IN p_amount DECIMAL(10,2),
  IN p_kwh DECIMAL(10,2)
)
BEGIN
  INSERT INTO recharge_pins (user_id, card_number, pin_code, amount, kwh)
  VALUES (p_user_id, p_card_number, p_pin_code, p_amount, p_kwh);
  SELECT LAST_INSERT_ID() AS inserted_id;
END $$

DROP PROCEDURE IF EXISTS sp_energy_cards_insert $$
CREATE PROCEDURE sp_energy_cards_insert(
  IN p_user_id INT,
  IN p_card_number VARCHAR(50),
  IN p_name VARCHAR(100)
)
BEGIN
  INSERT INTO energy_cards (user_id, card_number, name, current_balance, current_kwh)
  VALUES (p_user_id, p_card_number, p_name, 0, 0);
  SELECT LAST_INSERT_ID() AS inserted_id;
END $$

DROP PROCEDURE IF EXISTS sp_energy_cards_claim_released_by_id $$
CREATE PROCEDURE sp_energy_cards_claim_released_by_id(IN p_card_id INT, IN p_user_id INT, IN p_name VARCHAR(100))
BEGIN
  UPDATE energy_cards
  SET user_id = p_user_id,
      name = COALESCE(p_name, name),
      released = 0,
      released_by_user_id = NULL,
      released_at = NULL
  WHERE id = p_card_id;
  SELECT ROW_COUNT() AS affected_rows;
END $$

DROP PROCEDURE IF EXISTS sp_energy_cards_list_by_user $$
CREATE PROCEDURE sp_energy_cards_list_by_user(IN p_user_id INT)
BEGIN
  SELECT card_number, name, current_balance, current_kwh, last_recharge
  FROM energy_cards
  WHERE user_id = p_user_id
  ORDER BY COALESCE(name, card_number) ASC;
END $$

DROP PROCEDURE IF EXISTS sp_energy_cards_get_by_user_and_card $$
CREATE PROCEDURE sp_energy_cards_get_by_user_and_card(IN p_user_id INT, IN p_card_number VARCHAR(50))
BEGIN
  SELECT card_number, name, current_balance, current_kwh, last_recharge
  FROM energy_cards
  WHERE user_id = p_user_id AND card_number = p_card_number
  LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_energy_cards_release_by_user_and_card $$
CREATE PROCEDURE sp_energy_cards_release_by_user_and_card(
  IN p_user_id INT,
  IN p_card_number VARCHAR(50),
  IN p_released_by_user_id INT
)
BEGIN
  UPDATE energy_cards
  SET user_id = NULL,
      released = 1,
      released_by_user_id = p_released_by_user_id,
      released_at = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id AND card_number = p_card_number;
  SELECT ROW_COUNT() AS affected_rows;
END $$

DROP PROCEDURE IF EXISTS sp_energy_cards_update_name_by_user_and_card $$
CREATE PROCEDURE sp_energy_cards_update_name_by_user_and_card(
  IN p_user_id INT,
  IN p_card_number VARCHAR(50),
  IN p_name VARCHAR(100)
)
BEGIN
  UPDATE energy_cards
  SET name = p_name
  WHERE user_id = p_user_id AND card_number = p_card_number;
  SELECT ROW_COUNT() AS affected_rows;
END $$

DROP PROCEDURE IF EXISTS sp_energy_cards_lock_by_card $$
CREATE PROCEDURE sp_energy_cards_lock_by_card(IN p_card_number VARCHAR(50))
BEGIN
  SELECT id, user_id
  FROM energy_cards
  WHERE card_number = p_card_number
  LIMIT 1 FOR UPDATE;
END $$

DROP PROCEDURE IF EXISTS sp_energy_cards_transfer_owner $$
CREATE PROCEDURE sp_energy_cards_transfer_owner(IN p_card_id INT, IN p_to_user_id INT)
BEGIN
  UPDATE energy_cards
  SET user_id = p_to_user_id,
      released = 0,
      released_by_user_id = NULL,
      released_at = NULL
  WHERE id = p_card_id;
  SELECT ROW_COUNT() AS affected_rows;
END $$

-- Recharge pins queries used in dashboard and metrics
DROP PROCEDURE IF EXISTS sp_recharge_pins_latest $$
CREATE PROCEDURE sp_recharge_pins_latest(IN p_limit INT)
BEGIN
  IF p_limit IS NULL OR p_limit <= 0 THEN SET p_limit = 100; END IF;
  SELECT rp.user_id, u.email, rp.pin_code, rp.amount, rp.kwh, rp.created_at, rp.card_number
  FROM recharge_pins rp
  LEFT JOIN users u ON u.id = rp.user_id
  ORDER BY rp.created_at DESC
  LIMIT p_limit;
END $$

DROP PROCEDURE IF EXISTS sp_recharge_pins_list_by_user $$
CREATE PROCEDURE sp_recharge_pins_list_by_user(IN p_user_id INT)
BEGIN
  SELECT rp.user_id, u.email, rp.pin_code, rp.amount, rp.kwh, rp.created_at, rp.card_number
  FROM recharge_pins rp
  LEFT JOIN users u ON u.id = rp.user_id
  WHERE rp.user_id = p_user_id
  ORDER BY rp.created_at DESC;
END $$

-- Admin and Audit listings
DROP PROCEDURE IF EXISTS sp_admin_list_users $$
CREATE PROCEDURE sp_admin_list_users()
BEGIN
  SELECT u.id, u.username, u.email, u.created_at, u.last_login,
         r.name AS role, s.name AS status
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  LEFT JOIN statuses s ON s.id = u.status_id
  WHERE r.name <> 'audit'
  ORDER BY u.created_at DESC;
END $$

DROP PROCEDURE IF EXISTS sp_audit_list_admins $$
CREATE PROCEDURE sp_audit_list_admins()
BEGIN
  SELECT u.id, u.username, u.email, u.created_at, u.last_login,
         r.name AS role, s.name AS status
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  LEFT JOIN statuses s ON s.id = u.status_id
  WHERE r.name = 'admin'
  ORDER BY u.created_at DESC;
END $$

DROP PROCEDURE IF EXISTS sp_audit_list_employees $$
CREATE PROCEDURE sp_audit_list_employees()
BEGIN
  SELECT u.id, u.username, u.email, u.created_at, u.last_login,
         r.name AS role, s.name AS status
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  LEFT JOIN statuses s ON s.id = u.status_id
  WHERE r.name IN ('admin','audit')
  ORDER BY u.created_at DESC;
END $$

DROP PROCEDURE IF EXISTS sp_audit_metrics_totals $$
CREATE PROCEDURE sp_audit_metrics_totals()
BEGIN
  SELECT COUNT(*) AS pins,
         COALESCE(SUM(amount),0) AS total_amount,
         COALESCE(SUM(kwh),0) AS total_kwh
  FROM recharge_pins;
END $$

DROP PROCEDURE IF EXISTS sp_audit_metrics_series $$
CREATE PROCEDURE sp_audit_metrics_series(IN p_days INT)
BEGIN
  IF p_days IS NULL OR p_days <= 0 THEN SET p_days = 30; END IF;
  SELECT DATE(created_at) AS day,
         COUNT(*) AS pins,
         COALESCE(SUM(amount),0) AS amount,
         COALESCE(SUM(kwh),0) AS kwh
  FROM recharge_pins
  WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL p_days DAY)
  GROUP BY DATE(created_at)
  ORDER BY DATE(created_at) ASC;
END $$

-- Dashboard helpers
DROP PROCEDURE IF EXISTS sp_users_info_by_id $$
CREATE PROCEDURE sp_users_info_by_id(IN p_user_id INT)
BEGIN
  SELECT u.username, r.name AS role_name, s.name AS status_name
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  LEFT JOIN statuses s ON s.id = u.status_id
  WHERE u.id = p_user_id
  LIMIT 1;
END $$

-- Profiles
DROP PROCEDURE IF EXISTS sp_user_profiles_get_by_user $$
CREATE PROCEDURE sp_user_profiles_get_by_user(IN p_user_id INT)
BEGIN
  SELECT primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
         tipo_identificacion, numero_identificacion, direccion, telefono
  FROM user_profiles WHERE user_id = p_user_id LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_user_profiles_upsert $$
CREATE PROCEDURE sp_user_profiles_upsert(
  IN p_user_id INT,
  IN p_pn VARCHAR(100),
  IN p_sn VARCHAR(100),
  IN p_pa VARCHAR(100),
  IN p_sa VARCHAR(100),
  IN p_tipo VARCHAR(50),
  IN p_numero VARCHAR(100),
  IN p_direccion VARCHAR(255),
  IN p_telefono VARCHAR(50)
)
BEGIN
  INSERT INTO user_profiles
  (user_id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
   tipo_identificacion, numero_identificacion, direccion, telefono)
  VALUES (p_user_id, p_pn, p_sn, p_pa, p_sa, p_tipo, p_numero, p_direccion, p_telefono)
  ON DUPLICATE KEY UPDATE
    primer_nombre = VALUES(primer_nombre),
    segundo_nombre = VALUES(segundo_nombre),
    primer_apellido = VALUES(primer_apellido),
    segundo_apellido = VALUES(segundo_apellido),
    tipo_identificacion = VALUES(tipo_identificacion),
    numero_identificacion = VALUES(numero_identificacion),
    direccion = VALUES(direccion),
    telefono = VALUES(telefono),
    updated_at = CURRENT_TIMESTAMP;
  SELECT ROW_COUNT() AS affected_rows;
END $$

-- Admin meter transfer
DROP PROCEDURE IF EXISTS sp_users_exists_by_id $$
CREATE PROCEDURE sp_users_exists_by_id(IN p_user_id INT)
BEGIN
  SELECT id FROM users WHERE id = p_user_id LIMIT 1;
END $$

-- KWh price history
DROP PROCEDURE IF EXISTS sp_kwh_price_history_insert $$
CREATE PROCEDURE sp_kwh_price_history_insert(IN p_admin_user_id INT, IN p_price DECIMAL(10,2))
BEGIN
  INSERT INTO kwh_price_history (admin_user_id, price_cop) VALUES (p_admin_user_id, p_price);
  SELECT LAST_INSERT_ID() AS inserted_id;
END $$

DELIMITER ;