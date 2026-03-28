-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 27, 2026 at 02:16 AM
-- Server version: 8.0.45-0ubuntu0.24.04.1
-- PHP Version: 8.3.6

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ener-go`
--
CREATE DATABASE IF NOT EXISTS `ener-go` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `ener-go`;

DELIMITER $$
--
-- Procedures
--
DROP PROCEDURE IF EXISTS `sp_admin_list_users`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_admin_list_users` ()   BEGIN
  SELECT u.id, u.username, u.email, u.created_at, u.last_login,
         r.name AS role, s.name AS status
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  LEFT JOIN statuses s ON s.id = u.status_id
  WHERE r.name COLLATE utf8mb4_general_ci <> 'audit'
  ORDER BY u.created_at DESC;
END$$

DROP PROCEDURE IF EXISTS `sp_audit_list_admins`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_audit_list_admins` ()   BEGIN
  SELECT u.id, u.username, u.email, u.created_at, u.last_login,
         r.name AS role, s.name AS status
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  LEFT JOIN statuses s ON s.id = u.status_id
  WHERE r.name COLLATE utf8mb4_general_ci = 'admin'
  ORDER BY u.created_at DESC;
END$$

DROP PROCEDURE IF EXISTS `sp_audit_list_employees`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_audit_list_employees` ()   BEGIN
  SELECT u.id, u.username, u.email, u.created_at, u.last_login,
         r.name AS role, s.name AS status
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  LEFT JOIN statuses s ON s.id = u.status_id
  WHERE r.name COLLATE utf8mb4_general_ci IN ('admin','audit')
  ORDER BY u.created_at DESC;
END$$

DROP PROCEDURE IF EXISTS `sp_audit_metrics_series`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_audit_metrics_series` (IN `p_days` INT)   BEGIN
  IF p_days IS NULL OR p_days <= 0 THEN SET p_days = 30;
  END IF;
  SELECT COUNT(*) AS pins,
         COALESCE(SUM(amount),0) AS total_amount,
         COALESCE(SUM(kwh),0) AS total_kwh
  FROM recharge_pins
  WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL p_days DAY);
END$$

DROP PROCEDURE IF EXISTS `sp_audit_metrics_totals`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_audit_metrics_totals` ()   BEGIN
  SELECT COUNT(*) AS pins,
         COALESCE(SUM(amount),0) AS total_amount,
         COALESCE(SUM(kwh),0) AS total_kwh
  FROM recharge_pins;
END$$

DROP PROCEDURE IF EXISTS `sp_employee_codes_get_for_update`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_employee_codes_get_for_update` (IN `p_code` VARCHAR(100))   BEGIN
  SELECT id, role_id, used FROM employee_codes
  WHERE code = CONVERT(p_code USING utf8mb4) COLLATE utf8mb4_general_ci
  LIMIT 1 FOR UPDATE;
END$$

DROP PROCEDURE IF EXISTS `sp_employee_codes_insert`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_employee_codes_insert` (IN `p_code` VARCHAR(100), IN `p_role_id` INT)   BEGIN
  INSERT INTO employee_codes (code, role_id, used) VALUES (p_code, p_role_id, 0);
END$$

DROP PROCEDURE IF EXISTS `sp_employee_codes_list`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_employee_codes_list` ()   BEGIN
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
END$$

DROP PROCEDURE IF EXISTS `sp_employee_codes_mark_used`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_employee_codes_mark_used` (IN `p_id` INT, IN `p_usage_id` INT)   BEGIN
  UPDATE employee_codes
  SET used = 1, used_at = CURRENT_TIMESTAMP, employee_usage_id = p_usage_id
  WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS `sp_employee_code_usages_insert`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_employee_code_usages_insert` (IN `p_employee_code_id` INT, IN `p_user_id` INT)   BEGIN
  INSERT INTO employee_code_usages (employee_code_id, user_id) VALUES (p_employee_code_id, p_user_id);
END$$

DROP PROCEDURE IF EXISTS `sp_energy_cards_claim_released_by_id`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_energy_cards_claim_released_by_id` (IN `p_card_id` INT, IN `p_user_id` INT, IN `p_name` VARCHAR(100))   BEGIN
  UPDATE energy_cards
  SET user_id = p_user_id,
      name = COALESCE(p_name, name),
      released = 0,
      released_by_user_id = NULL,
      released_at = NULL
  WHERE id = p_card_id;
END$$

DROP PROCEDURE IF EXISTS `sp_energy_cards_find_by_card_number`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_energy_cards_find_by_card_number` (IN `p_card_number` VARCHAR(50))   BEGIN
  SELECT id, user_id, card_number, name, current_balance, current_kwh, last_recharge, released, released_by_user_id, released_at
  FROM energy_cards
  WHERE card_number = CONVERT(p_card_number USING utf8mb4) COLLATE utf8mb4_general_ci
  LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `sp_energy_cards_get_by_user_and_card`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_energy_cards_get_by_user_and_card` (IN `p_user_id` INT, IN `p_card_number` VARCHAR(50))   BEGIN
  SELECT card_number, name, current_balance, current_kwh, last_recharge
  FROM energy_cards
  WHERE user_id = p_user_id
    AND card_number = CONVERT(p_card_number USING utf8mb4) COLLATE utf8mb4_general_ci
  LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `sp_energy_cards_insert`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_energy_cards_insert` (IN `p_user_id` INT, IN `p_card_number` VARCHAR(50), IN `p_name` VARCHAR(100))   BEGIN
  INSERT INTO energy_cards (user_id, card_number, name, current_balance, current_kwh)
  VALUES (p_user_id, p_card_number, p_name, 0, 0);
END$$

DROP PROCEDURE IF EXISTS `sp_energy_cards_list_by_user`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_energy_cards_list_by_user` (IN `p_user_id` INT)   BEGIN
  SELECT card_number, name, current_balance, current_kwh, last_recharge
  FROM energy_cards
  WHERE user_id = p_user_id
  ORDER BY COALESCE(name, card_number) ASC;
END$$

DROP PROCEDURE IF EXISTS `sp_energy_cards_lock_by_card`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_energy_cards_lock_by_card` (IN `p_card_number` VARCHAR(50))   BEGIN
  SELECT id, user_id
  FROM energy_cards
  WHERE card_number = CONVERT(p_card_number USING utf8mb4) COLLATE utf8mb4_general_ci
  LIMIT 1 FOR UPDATE;
END$$

DROP PROCEDURE IF EXISTS `sp_energy_cards_release_by_user_and_card`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_energy_cards_release_by_user_and_card` (IN `p_user_id` INT, IN `p_card_number` VARCHAR(50), IN `p_released_by_user_id` INT)   BEGIN
  UPDATE energy_cards
  SET user_id = NULL,
      released = 1,
      released_by_user_id = p_released_by_user_id,
      released_at = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id
    AND card_number = CONVERT(p_card_number USING utf8mb4) COLLATE utf8mb4_general_ci;
END$$

DROP PROCEDURE IF EXISTS `sp_energy_cards_select_by_user_and_card_for_update`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_energy_cards_select_by_user_and_card_for_update` (IN `p_user_id` INT, IN `p_card_number` VARCHAR(50))   BEGIN
  SELECT card_number, current_balance, current_kwh
  FROM energy_cards
  WHERE user_id = p_user_id
    AND card_number = CONVERT(p_card_number USING utf8mb4) COLLATE utf8mb4_general_ci
  LIMIT 1 FOR UPDATE;
END$$

DROP PROCEDURE IF EXISTS `sp_energy_cards_select_one_by_user_for_update`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_energy_cards_select_one_by_user_for_update` (IN `p_user_id` INT)   BEGIN
  SELECT card_number, current_balance, current_kwh
  FROM energy_cards
  WHERE user_id = p_user_id
  FOR UPDATE;
END$$

DROP PROCEDURE IF EXISTS `sp_energy_cards_transfer_owner`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_energy_cards_transfer_owner` (IN `p_card_id` INT, IN `p_to_user_id` INT)   BEGIN
  UPDATE energy_cards
  SET user_id = p_to_user_id,
      released = 0,
      released_by_user_id = NULL,
      released_at = NULL
  WHERE id = p_card_id;
END$$

DROP PROCEDURE IF EXISTS `sp_energy_cards_update_balance`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_energy_cards_update_balance` (IN `p_user_id` INT, IN `p_card_number` VARCHAR(50), IN `p_new_balance` DECIMAL(10,2), IN `p_new_kwh` DECIMAL(10,2))   BEGIN
  UPDATE energy_cards
  SET current_balance = p_new_balance,
      current_kwh    = p_new_kwh,
      last_recharge  = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id
    AND card_number = CONVERT(p_card_number USING utf8mb4) COLLATE utf8mb4_general_ci;
END$$

DROP PROCEDURE IF EXISTS `sp_energy_cards_update_name_by_user_and_card`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_energy_cards_update_name_by_user_and_card` (IN `p_user_id` INT, IN `p_card_number` VARCHAR(50), IN `p_name` VARCHAR(100))   BEGIN
  UPDATE energy_cards
  SET name = p_name
  WHERE user_id = p_user_id
    AND card_number = CONVERT(p_card_number USING utf8mb4) COLLATE utf8mb4_general_ci;
END$$

DROP PROCEDURE IF EXISTS `sp_kwh_price_history_insert`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_kwh_price_history_insert` (IN `p_admin_user_id` INT, IN `p_price` DECIMAL(10,2))   BEGIN
  INSERT INTO kwh_price_history (admin_user_id, price_cop) VALUES (p_admin_user_id, p_price);
END$$

DROP PROCEDURE IF EXISTS `sp_ping`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ping` ()   BEGIN
  SELECT 1 AS ok;
END$$

DROP PROCEDURE IF EXISTS `sp_recharge_pins_insert`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_recharge_pins_insert` (IN `p_user_id` INT, IN `p_card_number` VARCHAR(50), IN `p_pin_code` VARCHAR(20), IN `p_amount` DECIMAL(10,2), IN `p_kwh` DECIMAL(10,2))   BEGIN
  INSERT INTO recharge_pins (user_id, card_number, pin_code, amount, kwh)
  VALUES (p_user_id, p_card_number, p_pin_code, p_amount, p_kwh);
END$$

DROP PROCEDURE IF EXISTS `sp_recharge_pins_latest`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_recharge_pins_latest` (IN `p_limit` INT)   BEGIN
  IF p_limit IS NULL OR p_limit <= 0 THEN SET p_limit = 100;
  END IF;
  SELECT rp.user_id, u.email, rp.pin_code, rp.amount, rp.kwh, rp.created_at, rp.card_number
  FROM recharge_pins rp
  LEFT JOIN users u ON u.id = rp.user_id
  ORDER BY rp.created_at DESC
  LIMIT p_limit;
END$$

DROP PROCEDURE IF EXISTS `sp_recharge_pins_list_by_user`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_recharge_pins_list_by_user` (IN `p_user_id` INT)   BEGIN
  SELECT rp.user_id, u.email, rp.pin_code, rp.amount, rp.kwh, rp.created_at, rp.card_number
  FROM recharge_pins rp
  LEFT JOIN users u ON u.id = rp.user_id
  WHERE rp.user_id = p_user_id
  ORDER BY rp.created_at DESC;
END$$

DROP PROCEDURE IF EXISTS `sp_roles_get_id_by_name`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_roles_get_id_by_name` (IN `p_name` VARCHAR(50))   BEGIN
  SELECT id FROM roles WHERE name = CONVERT(p_name USING utf8mb4) COLLATE utf8mb4_general_ci LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `sp_security_logs_insert`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_security_logs_insert` (IN `p_event_type` VARCHAR(50), IN `p_username` VARCHAR(50), IN `p_ip` VARCHAR(45), IN `p_details` TEXT)   BEGIN
  INSERT INTO security_logs (event_type, username, ip_address, details)
  VALUES (p_event_type, p_username, p_ip, p_details);
END$$

DROP PROCEDURE IF EXISTS `sp_security_logs_latest`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_security_logs_latest` (IN `p_limit` INT)   BEGIN
  IF p_limit IS NULL OR p_limit <= 0 THEN SET p_limit = 200;
  END IF;
  SELECT event_type, username, event_time, ip_address, details
  FROM security_logs
  ORDER BY event_time DESC
  LIMIT p_limit;
END$$

DROP PROCEDURE IF EXISTS `sp_settings_get`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_settings_get` (IN `p_key` VARCHAR(100))   BEGIN
  SELECT `value` FROM settings WHERE `key` = CONVERT(p_key USING utf8mb4) COLLATE utf8mb4_general_ci LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `sp_settings_upsert_cost_per_kwh`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_settings_upsert_cost_per_kwh` (IN `p_value` VARCHAR(255))   BEGIN
  INSERT INTO settings (`key`,`value`,`created_at`,`updated_at`)
  VALUES ('cost_per_kwh', p_value, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  ON DUPLICATE KEY UPDATE
    `value` = VALUES(`value`),
    `updated_at` = CURRENT_TIMESTAMP;
END$$

DROP PROCEDURE IF EXISTS `sp_set_kwh_price`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_set_kwh_price` (IN `p_admin_user_id` INT, IN `p_price` DECIMAL(10,2))   BEGIN
  DECLARE v_old_price DECIMAL(10,2);
  SELECT price_cop INTO v_old_price FROM kwh_price_history ORDER BY id DESC LIMIT 1;
  INSERT INTO kwh_price_history (admin_user_id, price_cop) VALUES (p_admin_user_id, p_price);
  INSERT INTO settings (`key`,`value`,`created_at`,`updated_at`)
  VALUES ('kwh_price', p_price, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  ON DUPLICATE KEY UPDATE
    `value` = VALUES(`value`),
    `updated_at` = CURRENT_TIMESTAMP;
END$$

DROP PROCEDURE IF EXISTS `sp_statuses_get_id_by_name`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_statuses_get_id_by_name` (IN `p_name` VARCHAR(50))   BEGIN
  SELECT id FROM statuses WHERE name = CONVERT(p_name USING utf8mb4) COLLATE utf8mb4_general_ci LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `sp_users_email_exists_other`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_email_exists_other` (IN `p_email` VARCHAR(100), IN `p_exclude_id` INT)   BEGIN
  SELECT id FROM users
  WHERE email = CONVERT(p_email USING utf8mb4) COLLATE utf8mb4_general_ci
    AND id <> p_exclude_id
  LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `sp_users_exists_by_id`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_exists_by_id` (IN `p_user_id` INT)   BEGIN
  SELECT id FROM users WHERE id = p_user_id LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `sp_users_find_by_username_or_email`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_find_by_username_or_email` (IN `p_username` VARCHAR(50), IN `p_email` VARCHAR(100))   BEGIN
  SELECT id FROM users
  WHERE username = CONVERT(p_username USING utf8mb4) COLLATE utf8mb4_general_ci
     OR email    = CONVERT(p_email USING utf8mb4) COLLATE utf8mb4_general_ci
  LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `sp_users_get_basic_by_id`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_get_basic_by_id` (IN `p_user_id` INT)   BEGIN
  SELECT username, email FROM users WHERE id = p_user_id LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `sp_users_get_password_hash`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_get_password_hash` (IN `p_user_id` INT)   BEGIN
  SELECT username, email, password_hash FROM users WHERE id = p_user_id LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `sp_users_info_by_id`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_info_by_id` (IN `p_user_id` INT)   BEGIN
  SELECT u.username, r.name AS role_name, s.name AS status_name
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  LEFT JOIN statuses s ON s.id = u.status_id
  WHERE u.id = p_user_id
  LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `sp_users_insert`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_insert` (IN `p_username` VARCHAR(50), IN `p_password_hash` VARCHAR(255), IN `p_email` VARCHAR(100), IN `p_role_id` INT, IN `p_status_id` INT)   BEGIN
  INSERT INTO users (username, password_hash, email, role_id, status_id)
  VALUES (p_username, p_password_hash, p_email, p_role_id, p_status_id);
END$$

DROP PROCEDURE IF EXISTS `sp_users_select_login_by_username`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_select_login_by_username` (IN `p_username` VARCHAR(50))   BEGIN
  SELECT u.id, u.password_hash, r.name AS role_name, s.name AS status_name
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  LEFT JOIN statuses s ON s.id = u.status_id
  WHERE u.username = CONVERT(p_username USING utf8mb4) COLLATE utf8mb4_general_ci
  LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `sp_users_select_role_status_by_id`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_select_role_status_by_id` (IN `p_user_id` INT)   BEGIN
  SELECT r.name AS role_name, s.name AS status_name
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
  LEFT JOIN statuses s ON s.id = u.status_id
  WHERE u.id = p_user_id
  LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `sp_users_update_email`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_update_email` (IN `p_user_id` INT, IN `p_email` VARCHAR(100))   BEGIN
  UPDATE users SET email = p_email WHERE id = p_user_id;
END$$

DROP PROCEDURE IF EXISTS `sp_users_update_last_login`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_update_last_login` (IN `p_user_id` INT)   BEGIN
  UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = p_user_id;
END$$

DROP PROCEDURE IF EXISTS `sp_users_update_password`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_update_password` (IN `p_user_id` INT, IN `p_hash` VARCHAR(255))   BEGIN
  UPDATE users SET password_hash = p_hash, password_changed_at = CURRENT_TIMESTAMP WHERE id = p_user_id;
END$$

DROP PROCEDURE IF EXISTS `sp_users_update_status_by_name`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_users_update_status_by_name` (IN `p_user_id` INT, IN `p_status_name` VARCHAR(50))   BEGIN
  DECLARE v_status_id INT DEFAULT NULL;
  SELECT id INTO v_status_id FROM statuses WHERE name = CONVERT(p_status_name USING utf8mb4) COLLATE utf8mb4_general_ci LIMIT 1;
  IF v_status_id IS NOT NULL THEN
    UPDATE users SET status_id = v_status_id WHERE id = p_user_id;
  END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_user_profiles_get_by_user`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_user_profiles_get_by_user` (IN `p_user_id` INT)   BEGIN
  SELECT primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
         tipo_identificacion, numero_identificacion, direccion, telefono
  FROM user_profiles WHERE user_id = p_user_id LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS `sp_user_profiles_upsert`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_user_profiles_upsert` (IN `p_user_id` INT, IN `p_pn` VARCHAR(100), IN `p_sn` VARCHAR(100), IN `p_pa` VARCHAR(100), IN `p_sa` VARCHAR(100), IN `p_tipo` VARCHAR(50), IN `p_numero` VARCHAR(100), IN `p_direccion` VARCHAR(255), IN `p_telefono` VARCHAR(50))   BEGIN
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
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `blocked`
--

DROP TABLE IF EXISTS `blocked`;
CREATE TABLE IF NOT EXISTS `blocked` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `reason` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `admin_user_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_blocked_user` (`user_id`),
  KEY `idx_blocked_admin` (`admin_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `blocked`:
--   `admin_user_id`
--       `users` -> `id`
--   `user_id`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `employee_codes`
--

DROP TABLE IF EXISTS `employee_codes`;
CREATE TABLE IF NOT EXISTS `employee_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `role_id` int NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `employee_usage_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `used_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `fk_employee_codes_role` (`role_id`),
  KEY `fk_employee_codes_usage` (`employee_usage_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `employee_codes`:
--   `role_id`
--       `roles` -> `id`
--   `employee_usage_id`
--       `employee_code_usages` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `employee_code_usages`
--

DROP TABLE IF EXISTS `employee_code_usages`;
CREATE TABLE IF NOT EXISTS `employee_code_usages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_code_id` int NOT NULL,
  `user_id` int NOT NULL,
  `used_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_employee_code_usages_code` (`employee_code_id`),
  KEY `fk_employee_code_usages_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `employee_code_usages`:
--   `employee_code_id`
--       `employee_codes` -> `id`
--   `user_id`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `energy_cards`
--

DROP TABLE IF EXISTS `energy_cards`;
CREATE TABLE IF NOT EXISTS `energy_cards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `released` tinyint(1) NOT NULL DEFAULT '0',
  `released_by_user_id` int DEFAULT NULL,
  `card_number` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `current_balance` decimal(10,2) DEFAULT '0.00',
  `current_kwh` decimal(10,2) DEFAULT '0.00',
  `last_recharge` timestamp NULL DEFAULT NULL,
  `released_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `card_number` (`card_number`),
  KEY `user_id` (`user_id`),
  KEY `idx_energy_cards_released_by_user` (`released_by_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `energy_cards`:
--   `user_id`
--       `users` -> `id`
--   `released_by_user_id`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `kwh_price_history`
--

DROP TABLE IF EXISTS `kwh_price_history`;
CREATE TABLE IF NOT EXISTS `kwh_price_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_user_id` int NOT NULL,
  `price_cop` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_kwh_price_history_admin` (`admin_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `kwh_price_history`:
--   `admin_user_id`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` char(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_token_hash` (`token_hash`),
  KEY `idx_password_resets_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `password_resets`:
--   `user_id`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `recharge_pins`
--

DROP TABLE IF EXISTS `recharge_pins`;
CREATE TABLE IF NOT EXISTS `recharge_pins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `card_number` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `pin_code` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `kwh` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `card_number` (`card_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `recharge_pins`:
--   `user_id`
--       `users` -> `id`
--   `card_number`
--       `energy_cards` -> `card_number`
--

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `roles`:
--

-- --------------------------------------------------------

--
-- Table structure for table `security_logs`
--

DROP TABLE IF EXISTS `security_logs`;
CREATE TABLE IF NOT EXISTS `security_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `event_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `security_logs`:
--

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `sid` varchar(255) NOT NULL,
  `sess` json NOT NULL,
  `expired` timestamp NOT NULL,
  PRIMARY KEY (`sid`),
  KEY `expired_idx` (`expired`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- RELATIONSHIPS FOR TABLE `sessions`:
--

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
CREATE TABLE IF NOT EXISTS `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `value` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `settings`:
--

-- --------------------------------------------------------

--
-- Table structure for table `statuses`
--

DROP TABLE IF EXISTS `statuses`;
CREATE TABLE IF NOT EXISTS `statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `statuses`:
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `password_changed_at` timestamp NULL DEFAULT NULL,
  `role_id` int NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_users_role` (`role_id`),
  KEY `idx_users_status` (`status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `users`:
--   `role_id`
--       `roles` -> `id`
--   `status_id`
--       `statuses` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `user_document_changes`
--

DROP TABLE IF EXISTS `user_document_changes`;
CREATE TABLE IF NOT EXISTS `user_document_changes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `old_tipo` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `old_numero` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `new_tipo` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `new_numero` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `changed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_document_changes_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `user_document_changes`:
--   `user_id`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `user_flags`
--

DROP TABLE IF EXISTS `user_flags`;
CREATE TABLE IF NOT EXISTS `user_flags` (
  `user_id` int NOT NULL,
  `personal_data_filled` tinyint(1) NOT NULL DEFAULT '0',
  `filled_at` timestamp NULL DEFAULT NULL,
  `document_change_used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `user_flags`:
--   `user_id`
--       `users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `primer_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `segundo_nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `primer_apellido` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `segundo_apellido` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo_identificacion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `numero_identificacion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `direccion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user` (`user_id`),
  UNIQUE KEY `uniq_documento` (`tipo_identificacion`,`numero_identificacion`),
  UNIQUE KEY `uniq_phone` (`telefono`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELATIONSHIPS FOR TABLE `user_profiles`:
--   `user_id`
--       `users` -> `id`
--

--
-- Constraints for dumped tables
--

--
-- Constraints for table `blocked`
--
ALTER TABLE `blocked`
  ADD CONSTRAINT `fk_blocked_admin` FOREIGN KEY (`admin_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_blocked_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee_codes`
--
ALTER TABLE `employee_codes`
  ADD CONSTRAINT `fk_employee_codes_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_employee_codes_usage` FOREIGN KEY (`employee_usage_id`) REFERENCES `employee_code_usages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `employee_code_usages`
--
ALTER TABLE `employee_code_usages`
  ADD CONSTRAINT `fk_employee_code_usages_code` FOREIGN KEY (`employee_code_id`) REFERENCES `employee_codes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_employee_code_usages_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `energy_cards`
--
ALTER TABLE `energy_cards`
  ADD CONSTRAINT `energy_cards_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_energy_cards_released_by_user` FOREIGN KEY (`released_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `kwh_price_history`
--
ALTER TABLE `kwh_price_history`
  ADD CONSTRAINT `fk_kwh_price_history_admin` FOREIGN KEY (`admin_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `fk_password_resets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `recharge_pins`
--
ALTER TABLE `recharge_pins`
  ADD CONSTRAINT `recharge_pins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `recharge_pins_ibfk_2` FOREIGN KEY (`card_number`) REFERENCES `energy_cards` (`card_number`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_users_status` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `user_document_changes`
--
ALTER TABLE `user_document_changes`
  ADD CONSTRAINT `fk_user_document_changes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_flags`
--
ALTER TABLE `user_flags`
  ADD CONSTRAINT `fk_user_flags_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `fk_user_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;