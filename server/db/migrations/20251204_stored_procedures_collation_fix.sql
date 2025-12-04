-- 2025-12-04: Collation fixes for stored procedures to avoid utf8mb4_0900_ai_ci vs utf8mb4_general_ci conflicts (MariaDB 10.x)
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_settings_get $$
CREATE PROCEDURE sp_settings_get(IN p_key VARCHAR(100))
BEGIN
  SELECT `value` FROM settings WHERE `key` = CONVERT(p_key USING utf8mb4) COLLATE utf8mb4_general_ci LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_users_find_by_username_or_email $$
CREATE PROCEDURE sp_users_find_by_username_or_email(IN p_username VARCHAR(50), IN p_email VARCHAR(100))
BEGIN
  SELECT id FROM users
  WHERE username = CONVERT(p_username USING utf8mb4) COLLATE utf8mb4_general_ci
     OR email    = CONVERT(p_email USING utf8mb4) COLLATE utf8mb4_general_ci
  LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_users_select_login_by_username $$
CREATE PROCEDURE sp_users_select_login_by_username(IN p_username VARCHAR(50))
BEGIN
  SELECT u.id, u.password_hash, r.name AS role_name, s.name AS status_name
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  LEFT JOIN statuses s ON s.id = u.status_id
  WHERE u.username = CONVERT(p_username USING utf8mb4) COLLATE utf8mb4_general_ci
  LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_roles_get_id_by_name $$
CREATE PROCEDURE sp_roles_get_id_by_name(IN p_name VARCHAR(50))
BEGIN
  SELECT id FROM roles WHERE name = CONVERT(p_name USING utf8mb4) COLLATE utf8mb4_general_ci LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_statuses_get_id_by_name $$
CREATE PROCEDURE sp_statuses_get_id_by_name(IN p_name VARCHAR(50))
BEGIN
  SELECT id FROM statuses WHERE name = CONVERT(p_name USING utf8mb4) COLLATE utf8mb4_general_ci LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_employee_codes_get_for_update $$
CREATE PROCEDURE sp_employee_codes_get_for_update(IN p_code VARCHAR(100))
BEGIN
  SELECT id, role_id, used FROM employee_codes
  WHERE code = CONVERT(p_code USING utf8mb4) COLLATE utf8mb4_general_ci
  LIMIT 1 FOR UPDATE;
END $$

DROP PROCEDURE IF EXISTS sp_users_update_status_by_name $$
CREATE PROCEDURE sp_users_update_status_by_name(IN p_user_id INT, IN p_status_name VARCHAR(50))
BEGIN
  DECLARE v_status_id INT DEFAULT NULL;
  SELECT id INTO v_status_id FROM statuses
  WHERE name = CONVERT(p_status_name USING utf8mb4) COLLATE utf8mb4_general_ci
  LIMIT 1;
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
  SELECT id FROM users
  WHERE email = CONVERT(p_email USING utf8mb4) COLLATE utf8mb4_general_ci
    AND id <> p_exclude_id
  LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_energy_cards_find_by_card_number $$
CREATE PROCEDURE sp_energy_cards_find_by_card_number(IN p_card_number VARCHAR(50))
BEGIN
  SELECT id, user_id, card_number, name, current_balance, current_kwh, last_recharge, released, released_by_user_id, released_at
  FROM energy_cards
  WHERE card_number = CONVERT(p_card_number USING utf8mb4) COLLATE utf8mb4_general_ci
  LIMIT 1;
END $$

DROP PROCEDURE IF EXISTS sp_energy_cards_select_by_user_and_card_for_update $$
CREATE PROCEDURE sp_energy_cards_select_by_user_and_card_for_update(IN p_user_id INT, IN p_card_number VARCHAR(50))
BEGIN
  SELECT card_number, current_balance, current_kwh
  FROM energy_cards
  WHERE user_id = p_user_id
    AND card_number = CONVERT(p_card_number USING utf8mb4) COLLATE utf8mb4_general_ci
  LIMIT 1 FOR UPDATE;
END $$

DROP PROCEDURE IF EXISTS sp_energy_cards_get_by_user_and_card $$
CREATE PROCEDURE sp_energy_cards_get_by_user_and_card(IN p_user_id INT, IN p_card_number VARCHAR(50))
BEGIN
  SELECT card_number, name, current_balance, current_kwh, last_recharge
  FROM energy_cards
  WHERE user_id = p_user_id
    AND card_number = CONVERT(p_card_number USING utf8mb4) COLLATE utf8mb4_general_ci
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
  WHERE user_id = p_user_id
    AND card_number = CONVERT(p_card_number USING utf8mb4) COLLATE utf8mb4_general_ci;
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
  WHERE user_id = p_user_id
    AND card_number = CONVERT(p_card_number USING utf8mb4) COLLATE utf8mb4_general_ci;
  SELECT ROW_COUNT() AS affected_rows;
END $$

DROP PROCEDURE IF EXISTS sp_energy_cards_lock_by_card $$
CREATE PROCEDURE sp_energy_cards_lock_by_card(IN p_card_number VARCHAR(50))
BEGIN
  SELECT id, user_id
  FROM energy_cards
  WHERE card_number = CONVERT(p_card_number USING utf8mb4) COLLATE utf8mb4_general_ci
  LIMIT 1 FOR UPDATE;
END $$

DROP PROCEDURE IF EXISTS sp_admin_list_users $$
CREATE PROCEDURE sp_admin_list_users()
BEGIN
  SELECT u.id, u.username, u.email, u.created_at, u.last_login,
         r.name AS role, s.name AS status
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  LEFT JOIN statuses s ON s.id = u.status_id
  WHERE r.name COLLATE utf8mb4_general_ci <> 'audit'
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
  WHERE r.name COLLATE utf8mb4_general_ci = 'admin'
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
  WHERE r.name COLLATE utf8mb4_general_ci IN ('admin','audit')
  ORDER BY u.created_at DESC;
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
  WHERE user_id = p_user_id
    AND card_number = CONVERT(p_card_number USING utf8mb4) COLLATE utf8mb4_general_ci;
  SELECT ROW_COUNT() AS affected_rows;
END $$

DELIMITER ;