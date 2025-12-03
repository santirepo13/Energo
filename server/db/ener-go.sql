-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 03, 2025 at 04:59 AM
-- Server version: 8.0.43-0ubuntu0.24.04.2
-- PHP Version: 8.3.6

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

-- --------------------------------------------------------

--
-- Table structure for table `employee_codes`
--

CREATE TABLE `employee_codes` (
  `id` int NOT NULL,
  `code` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `role_id` int NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `employee_usage_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `used_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_codes`
--

INSERT INTO `employee_codes` (`id`, `code`, `role_id`, `used`, `employee_usage_id`, `created_at`, `used_at`) VALUES
(1, 'ADMIN-12345', 1, 1, 1, '2025-11-11 23:58:03', '2025-11-12 00:21:29'),
(2, 'AUDIT-12345', 2, 1, 2, '2025-11-11 23:58:03', '2025-11-12 00:26:04'),
(3, 'X7G4Q9M2BZ', 1, 0, NULL, '2025-11-12 00:15:08', NULL),
(4, 'N5R8K1V0YC', 1, 0, NULL, '2025-11-12 00:15:08', NULL),
(5, 'P3H6T2L9DS', 1, 0, NULL, '2025-11-12 00:15:08', NULL),
(6, 'U2Z7C5Q8WF', 2, 1, 3, '2025-11-12 00:15:08', '2025-11-12 00:28:50'),
(7, 'M9L1S4B6KR', 2, 0, NULL, '2025-11-12 00:15:08', NULL),
(8, 'T0V3J8N5PX', 2, 0, NULL, '2025-11-12 00:15:08', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_code_usages`
--

CREATE TABLE `employee_code_usages` (
  `id` int NOT NULL,
  `employee_code_id` int NOT NULL,
  `user_id` int NOT NULL,
  `used_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_code_usages`
--

INSERT INTO `employee_code_usages` (`id`, `employee_code_id`, `user_id`, `used_at`) VALUES
(1, 1, 3, '2025-11-12 00:21:29'),
(2, 2, 5, '2025-11-12 00:26:04'),
(3, 6, 6, '2025-11-12 00:28:50');

-- --------------------------------------------------------

--
-- Table structure for table `energy_cards`
--

CREATE TABLE `energy_cards` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `card_number` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `current_balance` decimal(10,2) DEFAULT '0.00',
  `current_kwh` decimal(10,2) DEFAULT '0.00',
  `last_recharge` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `energy_cards`
--

INSERT INTO `energy_cards` (`id`, `user_id`, `card_number`, `current_balance`, `current_kwh`, `last_recharge`) VALUES
(1, 1, '54685394215', 10000.00, 11.11, '2025-11-11 23:44:54'),
(2, 2, '14416394063', 0.00, 0.00, NULL),
(3, 3, '', 0.00, 0.00, NULL),
(5, 7, '876345998725', 50000.00, 55.56, '2025-11-12 01:18:03'),
(6, 8, '65845236512', 0.00, 0.00, NULL),
(7, 9, '87590823612', 60000.00, 66.67, '2025-11-12 12:15:44');

-- --------------------------------------------------------

--
-- Table structure for table `recharge_pins`
--

CREATE TABLE `recharge_pins` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `card_number` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `pin_code` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `kwh` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `recharge_pins`
--

INSERT INTO `recharge_pins` (`id`, `user_id`, `card_number`, `pin_code`, `amount`, `kwh`, `created_at`) VALUES
(1, 1, '54685394215', '856765555577056', 10000.00, 11.11, '2025-11-11 23:44:54'),
(2, 7, '876345998725', '294881330545140', 50000.00, 55.56, '2025-11-12 01:18:03'),
(3, 9, '87590823612', '354229650630407', 60000.00, 66.67, '2025-11-12 12:15:44');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'admin', 'Administrator', '2025-11-11 23:58:03'),
(2, 'audit', 'Audit user', '2025-11-11 23:58:03'),
(3, 'user', 'Regular user', '2025-11-11 23:58:03');

-- --------------------------------------------------------

--
-- Table structure for table `security_logs`
--

CREATE TABLE `security_logs` (
  `id` int NOT NULL,
  `event_type` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `username` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `event_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `security_logs`
--

INSERT INTO `security_logs` (`id`, `event_type`, `username`, `event_time`, `ip_address`, `details`) VALUES
(1, 'register_success', 'mgault1s', '2025-11-11 23:44:30', '::1', '{\"user_id\":1,\"card_number\":\"54685394215\"}'),
(2, 'login_success', 'mgault1s', '2025-11-11 23:44:34', '::1', '{}'),
(3, 'recharge', 'mgault1s', '2025-11-11 23:44:54', '::1', '{\"amount\":10000,\"kwh\":11.11,\"pin\":\"856765555577056\"}'),
(4, 'parse_error', NULL, '2025-11-11 23:46:40', '::1', '{\"error\":\"Expected property name or \'}\' in JSON at position 1 (line 1 column 2)\",\"rawBody\":\"{\\\\\",\"url\":\"/api/register\",\"headers\":{\"host\":\"localhost:4000\",\"user-agent\":\"curl/8.14.1\",\"accept\":\"*/*\",\"content-type\":\"application/json\",\"content-length\":\"2\"}}'),
(5, 'register_success', 'testuser1', '2025-11-11 23:47:15', '::1', '{\"user_id\":2,\"card_number\":\"14416394063\"}'),
(6, 'login_success', 'mgault1s', '2025-11-11 23:50:20', '::1', '{}'),
(7, 'register_success', 'admin', '2025-11-12 00:21:29', '::1', '{\"user_id\":3,\"card_number\":\"\",\"role_id\":1}'),
(8, 'register_error', 'audithor', '2025-11-12 00:24:42', '::1', '{\"error\":\"Duplicate entry \'\' for key \'card_number\'\"}'),
(9, 'register_success', 'audithor', '2025-11-12 00:26:04', '::1', '{\"user_id\":5,\"card_number\":\"\",\"role_id\":2}'),
(10, 'login_success', 'audithor', '2025-11-12 00:26:08', '::1', '{}'),
(11, 'register_code_used', 'audithor2', '2025-11-12 00:27:36', '::1', '{\"employee_code\":\"AUDIT-12345\"}'),
(12, 'register_duplicate', 'audithor', '2025-11-12 00:28:26', '::1', '{\"username\":\"audithor\",\"email\":\"admin2@energo.co\"}'),
(13, 'register_duplicate', 'audithor', '2025-11-12 00:28:46', '::1', '{\"username\":\"audithor\",\"email\":\"admin2@energo.co\"}'),
(14, 'register_success', 'audithor2', '2025-11-12 00:28:50', '::1', '{\"user_id\":6,\"role_id\":2}'),
(15, 'login_success', 'admin', '2025-11-12 00:52:50', '::1', '{\"role\":\"admin\",\"status\":\"Activo\"}'),
(16, 'login_success', 'admin', '2025-11-12 01:06:37', '::1', '{\"role\":\"admin\",\"status\":\"Activo\"}'),
(17, 'logout', 'admin', '2025-11-12 01:06:59', '::1', '{}'),
(18, 'login_success', 'audithor', '2025-11-12 01:07:01', '::1', '{\"role\":\"audit\",\"status\":\"Activo\"}'),
(19, 'logout', 'audithor', '2025-11-12 01:07:13', '::1', '{}'),
(20, 'login_success', 'admin', '2025-11-12 01:07:17', '::1', '{\"role\":\"admin\",\"status\":\"Activo\"}'),
(21, 'login_success', 'admin', '2025-11-12 01:17:09', '::1', '{\"role\":\"admin\",\"status\":\"Activo\"}'),
(22, 'logout', 'admin', '2025-11-12 01:17:13', '::1', '{}'),
(23, 'login_failed', 'mgault1s@macromedia.com', '2025-11-12 01:17:15', '::1', '{\"reason\":\"user_not_found\"}'),
(24, 'login_failed', 'mgault1s@macromedia.com', '2025-11-12 01:17:23', '::1', '{\"reason\":\"user_not_found\"}'),
(25, 'register_success', 'mgault1se@macromedia.com', '2025-11-12 01:17:53', '::1', '{\"user_id\":7,\"card_number\":\"876345998725\",\"role_id\":3}'),
(26, 'login_success', 'mgault1se@macromedia.com', '2025-11-12 01:17:57', '::1', '{\"role\":\"user\",\"status\":\"Activo\"}'),
(27, 'recharge', 'mgault1se@macromedia.com', '2025-11-12 01:18:03', '::1', '{\"amount\":50000,\"kwh\":55.56,\"pin\":\"294881330545140\"}'),
(28, 'logout', 'mgault1se@macromedia.com', '2025-11-12 01:18:08', '::1', '{}'),
(29, 'login_success', 'audithor', '2025-11-12 01:18:11', '::1', '{\"role\":\"audit\",\"status\":\"Activo\"}'),
(30, 'logout', 'audithor', '2025-11-12 01:18:20', '::1', '{}'),
(31, 'login_success', 'admin', '2025-11-12 01:19:24', '::1', '{\"role\":\"admin\",\"status\":\"Activo\"}'),
(32, 'login_success', 'admin', '2025-11-12 01:31:25', '::1', '{\"role\":\"admin\",\"status\":\"Activo\"}'),
(33, 'logout', 'admin', '2025-11-12 01:31:34', '::1', '{}'),
(34, 'login_success', 'audithor', '2025-11-12 01:31:36', '::1', '{\"role\":\"audit\",\"status\":\"Activo\"}'),
(35, 'logout', 'audithor', '2025-11-12 01:33:50', '::1', '{}'),
(36, 'login_success', 'admin', '2025-11-12 02:39:34', '127.0.0.1', '{\"role\":\"admin\",\"status\":\"Activo\"}'),
(37, 'logout', 'admin', '2025-11-12 02:39:52', '127.0.0.1', '{}'),
(38, 'login_success', 'audithor', '2025-11-12 02:39:57', '127.0.0.1', '{\"role\":\"audit\",\"status\":\"Activo\"}'),
(39, 'logout', 'audithor', '2025-11-12 02:40:18', '127.0.0.1', '{}'),
(40, 'login_success', 'admin', '2025-11-12 03:51:43', '127.0.0.1', '{\"role\":\"admin\",\"status\":\"Activo\"}'),
(41, 'logout', 'admin', '2025-11-12 03:53:14', '127.0.0.1', '{}'),
(42, 'register_success', 'milovik', '2025-11-12 03:53:43', '127.0.0.1', '{\"user_id\":8,\"card_number\":\"65845236512\",\"role_id\":3}'),
(43, 'login_success', 'milovik', '2025-11-12 03:53:57', '127.0.0.1', '{\"role\":\"user\",\"status\":\"Activo\"}'),
(44, 'logout', 'milovik', '2025-11-12 03:54:04', '127.0.0.1', '{}'),
(45, 'register_duplicate', 'c:/Windows/system.ini', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"c:/Windows/system.ini\",\"email\":\"milovik@entesting.com\"}'),
(46, 'register_duplicate', 'c:\\Windows\\system.ini', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"c:\\\\Windows\\\\system.ini\",\"email\":\"milovik@entesting.com\"}'),
(47, 'register_duplicate', '/etc/passwd', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"/etc/passwd\",\"email\":\"milovik@entesting.com\"}'),
(48, 'register_duplicate', '/', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"/\",\"email\":\"milovik@entesting.com\"}'),
(49, 'register_duplicate', '../../../../../../../../../../../../../../../../', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"../../../../../../../../../../../../../../../../\",\"email\":\"milovik@entesting.com\"}'),
(50, 'register_duplicate', 'c:/', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"c:/\",\"email\":\"milovik@entesting.com\"}'),
(51, 'register_duplicate', 'c:\\', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"c:\\\\\",\"email\":\"milovik@entesting.com\"}'),
(52, 'register_duplicate', 'WEB-INF/web.xml', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"WEB-INF/web.xml\",\"email\":\"milovik@entesting.com\"}'),
(53, 'register_duplicate', 'WEB-INF\\web.xml', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"WEB-INF\\\\web.xml\",\"email\":\"milovik@entesting.com\"}'),
(54, 'register_duplicate', '/WEB-INF/web.xml', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"/WEB-INF/web.xml\",\"email\":\"milovik@entesting.com\"}'),
(55, 'register_duplicate', '\\WEB-INF\\web.xml', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"\\\\WEB-INF\\\\web.xml\",\"email\":\"milovik@entesting.com\"}'),
(56, 'register_duplicate', 'thishouldnotexistandhopefullyitwillnot', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"thishouldnotexistandhopefullyitwillnot\",\"email\":\"milovik@entesting.com\"}'),
(57, 'register_duplicate', 'register', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"register\",\"email\":\"milovik@entesting.com\"}'),
(58, 'register_duplicate', '/register', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"/register\",\"email\":\"milovik@entesting.com\"}'),
(59, 'register_duplicate', '\\register', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"\\\\register\",\"email\":\"milovik@entesting.com\"}'),
(60, 'register_duplicate', 'milovik', '2025-11-12 03:57:37', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(61, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(62, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(63, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(64, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(65, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(66, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(67, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(68, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(69, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(70, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(71, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(72, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(73, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(74, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(75, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(76, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(77, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(78, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"c:/Windows/system.ini\"}'),
(79, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"../../../../../../../../../../../../../../../../Windows/system.ini\"}'),
(80, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"c:\\\\Windows\\\\system.ini\"}'),
(81, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\..\\\\Windows\\\\system.ini\"}'),
(82, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"/etc/passwd\"}'),
(83, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"../../../../../../../../../../../../../../../../etc/passwd\"}'),
(84, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"/\"}'),
(85, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"../../../../../../../../../../../../../../../../\"}'),
(86, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"c:/\"}'),
(87, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"c:\\\\\"}'),
(88, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"WEB-INF/web.xml\"}'),
(89, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"WEB-INF\\\\web.xml\"}'),
(90, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"/WEB-INF/web.xml\"}'),
(91, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\\\\WEB-INF\\\\web.xml\"}'),
(92, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"thishouldnotexistandhopefullyitwillnot\"}'),
(93, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"register\"}'),
(94, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"/register\"}'),
(95, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\\\\register\"}'),
(96, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(97, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(98, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(99, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(100, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(101, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(102, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(103, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(104, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(105, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(106, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(107, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(108, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(109, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(110, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(111, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(112, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(113, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(114, 'register_duplicate', 'http://www.google.com/', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"http://www.google.com/\",\"email\":\"milovik@entesting.com\"}'),
(115, 'register_duplicate', 'http://www.google.com:80/', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"http://www.google.com:80/\",\"email\":\"milovik@entesting.com\"}'),
(116, 'register_duplicate', 'http://www.google.com', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"http://www.google.com\",\"email\":\"milovik@entesting.com\"}'),
(117, 'register_duplicate', 'http://www.google.com/search?q=ZAP', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"http://www.google.com/search?q=ZAP\",\"email\":\"milovik@entesting.com\"}'),
(118, 'register_duplicate', 'http://www.google.com:80/search?q=ZAP', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"http://www.google.com:80/search?q=ZAP\",\"email\":\"milovik@entesting.com\"}'),
(119, 'register_duplicate', 'www.google.com/', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"www.google.com/\",\"email\":\"milovik@entesting.com\"}'),
(120, 'register_duplicate', 'www.google.com:80/', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"www.google.com:80/\",\"email\":\"milovik@entesting.com\"}'),
(121, 'register_duplicate', 'www.google.com', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"www.google.com\",\"email\":\"milovik@entesting.com\"}'),
(122, 'register_duplicate', 'www.google.com/search?q=ZAP', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"www.google.com/search?q=ZAP\",\"email\":\"milovik@entesting.com\"}'),
(123, 'register_duplicate', 'www.google.com:80/search?q=ZAP', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"www.google.com:80/search?q=ZAP\",\"email\":\"milovik@entesting.com\"}'),
(124, 'register_duplicate', 'milovik', '2025-11-12 03:57:38', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(125, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(126, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(127, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(128, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(129, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(130, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(131, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(132, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(133, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(134, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"http://www.google.com/\"}'),
(135, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"http://www.google.com:80/\"}'),
(136, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"http://www.google.com\"}'),
(137, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"http://www.google.com/search?q=ZAP\"}'),
(138, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"http://www.google.com:80/search?q=ZAP\"}'),
(139, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"www.google.com/\"}'),
(140, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"www.google.com:80/\"}'),
(141, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"www.google.com\"}'),
(142, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"www.google.com/search?q=ZAP\"}'),
(143, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"www.google.com:80/search?q=ZAP\"}'),
(144, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(145, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(146, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(147, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(148, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(149, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(150, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(151, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(152, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(153, 'register_duplicate', 'milovik', '2025-11-12 03:57:39', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(154, 'register_duplicate', '3830550685498847313.owasp.org', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"3830550685498847313.owasp.org\",\"email\":\"milovik@entesting.com\"}'),
(155, 'register_duplicate', 'http://3830550685498847313.owasp.org', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"http://3830550685498847313.owasp.org\",\"email\":\"milovik@entesting.com\"}'),
(156, 'register_duplicate', 'https://3830550685498847313.owasp.org', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"https://3830550685498847313.owasp.org\",\"email\":\"milovik@entesting.com\"}'),
(157, 'register_duplicate', 'https://3830550685498847313%2eowasp%2eorg', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"https://3830550685498847313%2eowasp%2eorg\",\"email\":\"milovik@entesting.com\"}'),
(158, 'register_duplicate', '5;URL=\'https://3830550685498847313.owasp.org\'', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"5;URL=\'https://3830550685498847313.owasp.org\'\",\"email\":\"milovik@entesting.com\"}'),
(159, 'register_duplicate', 'URL=\'http://3830550685498847313.owasp.org\'', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"URL=\'http://3830550685498847313.owasp.org\'\",\"email\":\"milovik@entesting.com\"}'),
(160, 'register_duplicate', 'http://\\3830550685498847313.owasp.org', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"http://\\\\3830550685498847313.owasp.org\",\"email\":\"milovik@entesting.com\"}'),
(161, 'register_duplicate', 'https://\\3830550685498847313.owasp.org', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"https://\\\\3830550685498847313.owasp.org\",\"email\":\"milovik@entesting.com\"}'),
(162, 'register_duplicate', '//3830550685498847313.owasp.org', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"//3830550685498847313.owasp.org\",\"email\":\"milovik@entesting.com\"}'),
(163, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(164, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(165, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(166, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(167, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(168, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(169, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(170, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(171, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(172, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"3830550685498847313.owasp.org\"}'),
(173, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"http://3830550685498847313.owasp.org\"}'),
(174, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"https://3830550685498847313.owasp.org\"}'),
(175, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"https://3830550685498847313%2eowasp%2eorg\"}'),
(176, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"5;URL=\'https://3830550685498847313.owasp.org\'\"}'),
(177, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"URL=\'http://3830550685498847313.owasp.org\'\"}'),
(178, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"http://\\\\3830550685498847313.owasp.org\"}'),
(179, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"https://\\\\3830550685498847313.owasp.org\"}'),
(180, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"//3830550685498847313.owasp.org\"}'),
(181, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(182, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(183, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(184, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(185, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(186, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(187, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(188, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(189, 'register_duplicate', 'milovik', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(190, 'register_duplicate', '<!--#EXEC cmd=\"ls /\"-->', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"<!--#EXEC cmd=\\\"ls /\\\"-->\",\"email\":\"milovik@entesting.com\"}'),
(191, 'register_duplicate', '\"><!--#EXEC cmd=\"ls /\"--><', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"\\\"><!--#EXEC cmd=\\\"ls /\\\"--><\",\"email\":\"milovik@entesting.com\"}'),
(192, 'register_duplicate', '<!--#EXEC cmd=\"dir \\\"-->', '2025-11-12 03:57:40', '127.0.0.1', '{\"username\":\"<!--#EXEC cmd=\\\"dir \\\\\\\"-->\",\"email\":\"milovik@entesting.com\"}'),
(193, 'register_duplicate', '\"><!--#EXEC cmd=\"dir \\\"--><', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"\\\"><!--#EXEC cmd=\\\"dir \\\\\\\"--><\",\"email\":\"milovik@entesting.com\"}'),
(194, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(195, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(196, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(197, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(198, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"<!--#EXEC cmd=\\\"ls /\\\"-->\"}'),
(199, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\\\"><!--#EXEC cmd=\\\"ls /\\\"--><\"}'),
(200, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"<!--#EXEC cmd=\\\"dir \\\\\\\"-->\"}'),
(201, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\\\"><!--#EXEC cmd=\\\"dir \\\\\\\"--><\"}'),
(202, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(203, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(204, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(205, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(206, 'register_duplicate', '0W45pz4p', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"0W45pz4p\",\"email\":\"milovik@entesting.com\"}'),
(207, 'register_duplicate', 'milovik0W45pz4p', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik0W45pz4p\",\"email\":\"milovik@entesting.com\"}'),
(208, 'register_duplicate', '\'\"<scrIpt>alert(1);</scRipt>', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"\'\\\"<scrIpt>alert(1);</scRipt>\",\"email\":\"milovik@entesting.com\"}'),
(209, 'register_duplicate', '\'\"\0<scrIpt>alert(1);</scRipt>', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"\'\\\"\\u0000<scrIpt>alert(1);</scRipt>\",\"email\":\"milovik@entesting.com\"}'),
(210, 'register_duplicate', '\'\"<img src=x onerror=prompt()>', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"\'\\\"<img src=x onerror=prompt()>\",\"email\":\"milovik@entesting.com\"}'),
(211, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(212, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(213, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(214, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(215, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(216, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"0W45pz4p\"}'),
(217, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com0W45pz4p\"}'),
(218, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\'\\\"<scrIpt>alert(1);</scRipt>\"}'),
(219, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\'\\\"\\u0000<scrIpt>alert(1);</scRipt>\"}'),
(220, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\'\\\"<img src=x onerror=prompt()>\"}'),
(221, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(222, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(223, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(224, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(225, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(226, 'register_duplicate', 'zApPX0sS', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"zApPX0sS\",\"email\":\"milovik@entesting.com\"}'),
(227, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(228, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"zApPX3sS\"}'),
(229, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(230, 'register_duplicate', 'milovik', '2025-11-12 03:57:41', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(231, 'register_duplicate', '\'', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"\'\",\"email\":\"milovik@entesting.com\"}'),
(232, 'register_duplicate', 'milovik\'', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\'\",\"email\":\"milovik@entesting.com\"}'),
(233, 'register_duplicate', '\"', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"\\\"\",\"email\":\"milovik@entesting.com\"}'),
(234, 'register_duplicate', 'milovik\"', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\\\"\",\"email\":\"milovik@entesting.com\"}'),
(235, 'register_duplicate', ';', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\";\",\"email\":\"milovik@entesting.com\"}'),
(236, 'register_duplicate', 'milovik;', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik;\",\"email\":\"milovik@entesting.com\"}'),
(237, 'register_duplicate', '\'(', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"\'(\",\"email\":\"milovik@entesting.com\"}'),
(238, 'register_duplicate', 'milovik\'(', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\'(\",\"email\":\"milovik@entesting.com\"}'),
(239, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(240, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(241, 'register_duplicate', 'milovik AND 1=1 -- ', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik AND 1=1 -- \",\"email\":\"milovik@entesting.com\"}'),
(242, 'register_duplicate', 'milovik AND 1=2 -- ', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik AND 1=2 -- \",\"email\":\"milovik@entesting.com\"}'),
(243, 'register_duplicate', 'milovik OR 1=1 -- ', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik OR 1=1 -- \",\"email\":\"milovik@entesting.com\"}'),
(244, 'register_duplicate', 'milovik AND 1=2 -- ', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik AND 1=2 -- \",\"email\":\"milovik@entesting.com\"}'),
(245, 'register_duplicate', 'milovik OR 1=1 -- ', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik OR 1=1 -- \",\"email\":\"milovik@entesting.com\"}'),
(246, 'register_duplicate', 'milovik\' AND \'1\'=\'1\' -- ', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\' AND \'1\'=\'1\' -- \",\"email\":\"milovik@entesting.com\"}'),
(247, 'register_duplicate', 'milovik\' AND \'1\'=\'2\' -- ', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\' AND \'1\'=\'2\' -- \",\"email\":\"milovik@entesting.com\"}'),
(248, 'register_duplicate', 'milovik\' OR \'1\'=\'1\' -- ', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\' OR \'1\'=\'1\' -- \",\"email\":\"milovik@entesting.com\"}'),
(249, 'register_duplicate', 'milovik\' AND \'1\'=\'2\' -- ', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\' AND \'1\'=\'2\' -- \",\"email\":\"milovik@entesting.com\"}'),
(250, 'register_duplicate', 'milovik\' OR \'1\'=\'1\' -- ', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\' OR \'1\'=\'1\' -- \",\"email\":\"milovik@entesting.com\"}'),
(251, 'register_duplicate', 'milovik UNION ALL select NULL -- ', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik UNION ALL select NULL -- \",\"email\":\"milovik@entesting.com\"}'),
(252, 'register_duplicate', 'milovik\' UNION ALL select NULL -- ', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\' UNION ALL select NULL -- \",\"email\":\"milovik@entesting.com\"}'),
(253, 'register_duplicate', 'milovik\" UNION ALL select NULL -- ', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\\\" UNION ALL select NULL -- \",\"email\":\"milovik@entesting.com\"}'),
(254, 'register_duplicate', 'milovik) UNION ALL select NULL -- ', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik) UNION ALL select NULL -- \",\"email\":\"milovik@entesting.com\"}'),
(255, 'register_duplicate', 'milovik\') UNION ALL select NULL -- ', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\') UNION ALL select NULL -- \",\"email\":\"milovik@entesting.com\"}'),
(256, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(257, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(258, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(259, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(260, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(261, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(262, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(263, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(264, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(265, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(266, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(267, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(268, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(269, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(270, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(271, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(272, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(273, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(274, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(275, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(276, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(277, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(278, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(279, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(280, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(281, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(282, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(283, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(284, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(285, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(286, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(287, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\'\"}'),
(288, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\'\"}'),
(289, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\\\"\"}'),
(290, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\"\"}'),
(291, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\";\"}'),
(292, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com;\"}'),
(293, 'register_duplicate', 'milovik', '2025-11-12 03:57:42', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\'(\"}'),
(294, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\'(\"}'),
(295, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(296, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(297, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com AND 1=1 -- \"}'),
(298, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com AND 1=2 -- \"}'),
(299, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com OR 1=1 -- \"}'),
(300, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com AND 1=2 -- \"}'),
(301, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com OR 1=1 -- \"}'),
(302, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\' AND \'1\'=\'1\' -- \"}'),
(303, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\' AND \'1\'=\'2\' -- \"}'),
(304, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\' OR \'1\'=\'1\' -- \"}'),
(305, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\' AND \'1\'=\'2\' -- \"}'),
(306, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\' OR \'1\'=\'1\' -- \"}'),
(307, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com UNION ALL select NULL -- \"}'),
(308, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\' UNION ALL select NULL -- \"}'),
(309, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\" UNION ALL select NULL -- \"}'),
(310, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com) UNION ALL select NULL -- \"}'),
(311, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\') UNION ALL select NULL -- \"}'),
(312, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(313, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(314, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(315, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(316, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(317, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(318, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(319, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(320, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(321, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(322, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(323, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(324, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(325, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(326, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(327, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(328, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(329, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(330, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(331, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(332, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(333, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(334, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(335, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(336, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(337, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(338, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(339, 'register_duplicate', 'milovik / sleep(15) ', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik / sleep(15) \",\"email\":\"milovik@entesting.com\"}'),
(340, 'register_duplicate', 'milovik\' / sleep(15) / \'', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\' / sleep(15) / \'\",\"email\":\"milovik@entesting.com\"}'),
(341, 'register_duplicate', 'milovik\" / sleep(15) / \"', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\\\" / sleep(15) / \\\"\",\"email\":\"milovik@entesting.com\"}'),
(342, 'register_duplicate', 'milovik and 0 in (select sleep(15) ) -- ', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik and 0 in (select sleep(15) ) -- \",\"email\":\"milovik@entesting.com\"}'),
(343, 'register_duplicate', 'milovik\' and 0 in (select sleep(15) ) -- ', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\' and 0 in (select sleep(15) ) -- \",\"email\":\"milovik@entesting.com\"}'),
(344, 'register_duplicate', 'milovik\" and 0 in (select sleep(15) ) -- ', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\\\" and 0 in (select sleep(15) ) -- \",\"email\":\"milovik@entesting.com\"}'),
(345, 'register_duplicate', 'milovik where 0 in (select sleep(15) ) -- ', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik where 0 in (select sleep(15) ) -- \",\"email\":\"milovik@entesting.com\"}');
INSERT INTO `security_logs` (`id`, `event_type`, `username`, `event_time`, `ip_address`, `details`) VALUES
(346, 'register_duplicate', 'milovik\' where 0 in (select sleep(15) ) -- ', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\' where 0 in (select sleep(15) ) -- \",\"email\":\"milovik@entesting.com\"}'),
(347, 'register_duplicate', 'milovik\" where 0 in (select sleep(15) ) -- ', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\\\" where 0 in (select sleep(15) ) -- \",\"email\":\"milovik@entesting.com\"}'),
(348, 'register_duplicate', 'milovik or 0 in (select sleep(15) ) -- ', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik or 0 in (select sleep(15) ) -- \",\"email\":\"milovik@entesting.com\"}'),
(349, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(350, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(351, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(352, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(353, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(354, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(355, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(356, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(357, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(358, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(359, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com / sleep(15) \"}'),
(360, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\' / sleep(15) / \'\"}'),
(361, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\" / sleep(15) / \\\"\"}'),
(362, 'register_duplicate', 'milovik', '2025-11-12 03:57:43', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com and 0 in (select sleep(15) ) -- \"}'),
(363, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\' and 0 in (select sleep(15) ) -- \"}'),
(364, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\" and 0 in (select sleep(15) ) -- \"}'),
(365, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com where 0 in (select sleep(15) ) -- \"}'),
(366, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\' where 0 in (select sleep(15) ) -- \"}'),
(367, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\" where 0 in (select sleep(15) ) -- \"}'),
(368, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com or 0 in (select sleep(15) ) -- \"}'),
(369, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(370, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(371, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(372, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(373, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(374, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(375, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(376, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(377, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(378, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(379, 'register_duplicate', '\"java.lang.Thread.sleep\"(15000)', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"\\\"java.lang.Thread.sleep\\\"(15000)\",\"email\":\"milovik@entesting.com\"}'),
(380, 'register_duplicate', 'milovik / \"java.lang.Thread.sleep\"(15000) ', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik / \\\"java.lang.Thread.sleep\\\"(15000) \",\"email\":\"milovik@entesting.com\"}'),
(381, 'register_duplicate', 'milovik\' / \"java.lang.Thread.sleep\"(15000) / \'', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\' / \\\"java.lang.Thread.sleep\\\"(15000) / \'\",\"email\":\"milovik@entesting.com\"}'),
(382, 'register_duplicate', 'milovik\" / \"java.lang.Thread.sleep\"(15000) / \"', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\\\" / \\\"java.lang.Thread.sleep\\\"(15000) / \\\"\",\"email\":\"milovik@entesting.com\"}'),
(383, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(384, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(385, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(386, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(387, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(388, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(389, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(390, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(391, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(392, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(393, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"; select \\\"java.lang.Thread.sleep\\\"(15000) from INFORMATION_SCHEMA.SYSTEM_COLUMNS where TABLE_NAME = \'SYSTEM_COLUMNS\' and COLUMN_NAME = \'TABLE_NAME\' -- \"}'),
(394, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\'; select \\\"java.lang.Thread.sleep\\\"(15000) from INFORMATION_SCHEMA.SYSTEM_COLUMNS where TABLE_NAME = \'SYSTEM_COLUMNS\' and COLUMN_NAME = \'TABLE_NAME\' -- \"}'),
(395, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\\\"; select \\\"java.lang.Thread.sleep\\\"(15000) from INFORMATION_SCHEMA.SYSTEM_COLUMNS where TABLE_NAME = \'SYSTEM_COLUMNS\' and COLUMN_NAME = \'TABLE_NAME\' -- \"}'),
(396, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"); select \\\"java.lang.Thread.sleep\\\"(15000) from INFORMATION_SCHEMA.SYSTEM_COLUMNS where TABLE_NAME = \'SYSTEM_COLUMNS\' and COLUMN_NAME = \'TABLE_NAME\' -- \"}'),
(397, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\\\"java.lang.Thread.sleep\\\"(15000)\"}'),
(398, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com / \\\"java.lang.Thread.sleep\\\"(15000) \"}'),
(399, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\' / \\\"java.lang.Thread.sleep\\\"(15000) / \'\"}'),
(400, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\" / \\\"java.lang.Thread.sleep\\\"(15000) / \\\"\"}'),
(401, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com and exists ( select \\\"java.lang.Thread.sleep\\\"(15000) from INFORMATION_SCHEMA.SYSTEM_COLUMNS where TABLE_NAME = \'SYSTEM_COLUMNS\' and COLUMN_NAME = \'TABLE_NAME\') -- \"}'),
(402, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\' and exists ( select \\\"java.lang.Thread.sleep\\\"(15000) from INFORMATION_SCHEMA.SYSTEM_COLUMNS where TABLE_NAME = \'SYSTEM_COLUMNS\' and COLUMN_NAME = \'TABLE_NAME\') -- \"}'),
(403, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(404, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(405, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(406, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(407, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(408, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(409, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(410, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(411, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(412, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(413, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(414, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(415, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(416, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(417, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(418, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(419, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(420, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(421, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"(SELECT  UTL_INADDR.get_host_name(\'10.0.0.1\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.2\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.3\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.4\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.5\') from dual)\"}'),
(422, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com / (SELECT  UTL_INADDR.get_host_name(\'10.0.0.1\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.2\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.3\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.4\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.5\') from dual) \"}'),
(423, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\' / (SELECT  UTL_INADDR.get_host_name(\'10.0.0.1\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.2\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.3\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.4\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.5\') from dual) / \'\"}'),
(424, 'register_duplicate', 'milovik', '2025-11-12 03:57:44', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\" / (SELECT  UTL_INADDR.get_host_name(\'10.0.0.1\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.2\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.3\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.4\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.5\') from dual) / \\\"\"}'),
(425, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com and exists (SELECT  UTL_INADDR.get_host_name(\'10.0.0.1\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.2\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.3\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.4\') from dual union SELECT  UTL_INADDR.get_host_name(\'10.0.0.5\') from dual) -- \"}'),
(426, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(427, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(428, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(429, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(430, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(431, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(432, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(433, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(434, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(435, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(436, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(437, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"case when cast(pg_sleep(15.0) as varchar) > \'\' then 0 else 1 end\"}'),
(438, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"case when cast(pg_sleep(15.0) as varchar) > \'\' then 0 else 1 end -- \"}'),
(439, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\'case when cast(pg_sleep(15.0) as varchar) > \'\' then 0 else 1 end -- \"}'),
(440, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\\\"case when cast(pg_sleep(15.0) as varchar) > \'\' then 0 else 1 end -- \"}'),
(441, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com / case when cast(pg_sleep(15.0) as varchar) > \'\' then 0 else 1 end \"}'),
(442, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(443, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(444, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(445, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(446, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(447, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(448, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(449, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(450, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(451, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(452, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(453, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(454, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(455, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(456, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(457, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(458, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(459, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(460, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"case randomblob(100000) when not null then 1 else 1 end \"}'),
(461, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"9s96m7z7ok5zl17d3hriyqrzjahdeftyefhvdms3sd9jhc5223yma5bu\"}'),
(462, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"case randomblob(1000000) when not null then 1 else 1 end \"}'),
(463, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"case randomblob(10000000) when not null then 1 else 1 end \"}'),
(464, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"case randomblob(100000000) when not null then 1 else 1 end \"}'),
(465, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"case randomblob(1000000000) when not null then 1 else 1 end \"}'),
(466, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(467, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(468, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(469, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(470, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(471, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(472, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(473, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(474, 'register_duplicate', 'milovik', '2025-11-12 03:57:45', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(475, 'register_duplicate', 'milovik WAITFOR DELAY \'0:0:15\' -- ', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik WAITFOR DELAY \'0:0:15\' -- \",\"email\":\"milovik@entesting.com\"}'),
(476, 'register_duplicate', 'milovik\' WAITFOR DELAY \'0:0:15\' -- ', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\' WAITFOR DELAY \'0:0:15\' -- \",\"email\":\"milovik@entesting.com\"}'),
(477, 'register_duplicate', 'milovik\" WAITFOR DELAY \'0:0:15\' -- ', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\\\" WAITFOR DELAY \'0:0:15\' -- \",\"email\":\"milovik@entesting.com\"}'),
(478, 'register_duplicate', 'milovik) WAITFOR DELAY \'0:0:15\' -- ', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik) WAITFOR DELAY \'0:0:15\' -- \",\"email\":\"milovik@entesting.com\"}'),
(479, 'register_duplicate', 'milovik) \' WAITFOR DELAY \'0:0:15\' -- ', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik) \' WAITFOR DELAY \'0:0:15\' -- \",\"email\":\"milovik@entesting.com\"}'),
(480, 'register_duplicate', 'milovik) \" WAITFOR DELAY \'0:0:15\' -- ', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik) \\\" WAITFOR DELAY \'0:0:15\' -- \",\"email\":\"milovik@entesting.com\"}'),
(481, 'register_duplicate', 'milovik)) WAITFOR DELAY \'0:0:15\' -- ', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik)) WAITFOR DELAY \'0:0:15\' -- \",\"email\":\"milovik@entesting.com\"}'),
(482, 'register_duplicate', 'milovik)) \' WAITFOR DELAY \'0:0:15\' -- ', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik)) \' WAITFOR DELAY \'0:0:15\' -- \",\"email\":\"milovik@entesting.com\"}'),
(483, 'register_duplicate', 'milovik)) \" WAITFOR DELAY \'0:0:15\' -- ', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik)) \\\" WAITFOR DELAY \'0:0:15\' -- \",\"email\":\"milovik@entesting.com\"}'),
(484, 'register_duplicate', 'milovik) WAITFOR DELAY \'0:0:15\' (', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik) WAITFOR DELAY \'0:0:15\' (\",\"email\":\"milovik@entesting.com\"}'),
(485, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(486, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(487, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(488, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(489, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(490, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(491, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(492, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(493, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(494, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(495, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com WAITFOR DELAY \'0:0:15\' -- \"}'),
(496, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\' WAITFOR DELAY \'0:0:15\' -- \"}'),
(497, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\" WAITFOR DELAY \'0:0:15\' -- \"}'),
(498, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com) WAITFOR DELAY \'0:0:15\' -- \"}'),
(499, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com) \' WAITFOR DELAY \'0:0:15\' -- \"}'),
(500, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com) \\\" WAITFOR DELAY \'0:0:15\' -- \"}'),
(501, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com)) WAITFOR DELAY \'0:0:15\' -- \"}'),
(502, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com)) \' WAITFOR DELAY \'0:0:15\' -- \"}'),
(503, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com)) \\\" WAITFOR DELAY \'0:0:15\' -- \"}'),
(504, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com) WAITFOR DELAY \'0:0:15\' (\"}'),
(505, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(506, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(507, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(508, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(509, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(510, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(511, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(512, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(513, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(514, 'register_duplicate', 'milovik', '2025-11-12 03:57:46', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(515, 'register_duplicate', '\"+response.write(388,987*436,194)+\"', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"\\\"+response.write(388,987*436,194)+\\\"\",\"email\":\"milovik@entesting.com\"}'),
(516, 'register_duplicate', '+response.write({0}*{1})+', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"+response.write({0}*{1})+\",\"email\":\"milovik@entesting.com\"}'),
(517, 'register_duplicate', 'response.write(388,987*436,194)', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"response.write(388,987*436,194)\",\"email\":\"milovik@entesting.com\"}'),
(518, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(519, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(520, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(521, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(522, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(523, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(524, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(525, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(526, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\\\";print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110));$var=\\\"\"}'),
(527, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\';print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110));$var=\'\"}'),
(528, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"${@print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110))}\"}'),
(529, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"${@print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110))}\\\\\"}'),
(530, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\";print(chr(122).chr(97).chr(112).chr(95).chr(116).chr(111).chr(107).chr(101).chr(110));\"}'),
(531, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\\\"+response.write(309,574*100,348)+\\\"\"}'),
(532, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"+response.write({0}*{1})+\"}'),
(533, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"response.write(309,574*100,348)\"}'),
(534, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(535, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(536, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(537, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(538, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(539, 'register_duplicate', 'milovik', '2025-11-12 03:57:47', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(540, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(541, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(542, 'register_duplicate', 'cat /etc/passwd', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"cat /etc/passwd\",\"email\":\"milovik@entesting.com\"}'),
(543, 'register_duplicate', 'milovik&cat /etc/passwd&', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik&cat /etc/passwd&\",\"email\":\"milovik@entesting.com\"}'),
(544, 'register_duplicate', 'milovik;cat /etc/passwd;', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik;cat /etc/passwd;\",\"email\":\"milovik@entesting.com\"}'),
(545, 'register_duplicate', 'milovik\"&cat /etc/passwd&\"', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\\\"&cat /etc/passwd&\\\"\",\"email\":\"milovik@entesting.com\"}'),
(546, 'register_duplicate', 'milovik\";cat /etc/passwd;\"', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\\\";cat /etc/passwd;\\\"\",\"email\":\"milovik@entesting.com\"}'),
(547, 'register_duplicate', 'milovik\'&cat /etc/passwd&\'', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\'&cat /etc/passwd&\'\",\"email\":\"milovik@entesting.com\"}'),
(548, 'register_duplicate', 'milovik\';cat /etc/passwd;\'', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\';cat /etc/passwd;\'\",\"email\":\"milovik@entesting.com\"}'),
(549, 'register_duplicate', 'milovik&sleep 15.0&', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik&sleep 15.0&\",\"email\":\"milovik@entesting.com\"}'),
(550, 'register_duplicate', 'milovik;sleep 15.0;', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik;sleep 15.0;\",\"email\":\"milovik@entesting.com\"}'),
(551, 'register_duplicate', 'milovik\"&sleep 15.0&\"', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\\\"&sleep 15.0&\\\"\",\"email\":\"milovik@entesting.com\"}'),
(552, 'register_duplicate', 'milovik\";sleep 15.0;\"', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\\\";sleep 15.0;\\\"\",\"email\":\"milovik@entesting.com\"}'),
(553, 'register_duplicate', 'milovik\'&sleep 15.0&\'', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\'&sleep 15.0&\'\",\"email\":\"milovik@entesting.com\"}'),
(554, 'register_duplicate', 'milovik\';sleep 15.0;\'', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\';sleep 15.0;\'\",\"email\":\"milovik@entesting.com\"}'),
(555, 'register_duplicate', 'type %SYSTEMROOT%\\win.ini', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"type %SYSTEMROOT%\\\\win.ini\",\"email\":\"milovik@entesting.com\"}'),
(556, 'register_duplicate', 'milovik&type %SYSTEMROOT%\\win.ini', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik&type %SYSTEMROOT%\\\\win.ini\",\"email\":\"milovik@entesting.com\"}'),
(557, 'register_duplicate', 'milovik|type %SYSTEMROOT%\\win.ini', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik|type %SYSTEMROOT%\\\\win.ini\",\"email\":\"milovik@entesting.com\"}'),
(558, 'register_duplicate', 'milovik\"&type %SYSTEMROOT%\\win.ini&\"', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\\\"&type %SYSTEMROOT%\\\\win.ini&\\\"\",\"email\":\"milovik@entesting.com\"}'),
(559, 'register_duplicate', 'milovik\"|type %SYSTEMROOT%\\win.ini', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\\\"|type %SYSTEMROOT%\\\\win.ini\",\"email\":\"milovik@entesting.com\"}'),
(560, 'register_duplicate', 'milovik\'&type %SYSTEMROOT%\\win.ini&\'', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\'&type %SYSTEMROOT%\\\\win.ini&\'\",\"email\":\"milovik@entesting.com\"}'),
(561, 'register_duplicate', 'milovik\'|type %SYSTEMROOT%\\win.ini', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\'|type %SYSTEMROOT%\\\\win.ini\",\"email\":\"milovik@entesting.com\"}'),
(562, 'register_duplicate', 'milovik&timeout /T 15.0', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik&timeout /T 15.0\",\"email\":\"milovik@entesting.com\"}'),
(563, 'register_duplicate', 'milovik|timeout /T 15.0', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik|timeout /T 15.0\",\"email\":\"milovik@entesting.com\"}'),
(564, 'register_duplicate', 'milovik\"&timeout /T 15.0&\"', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\\\"&timeout /T 15.0&\\\"\",\"email\":\"milovik@entesting.com\"}'),
(565, 'register_duplicate', 'milovik\"|timeout /T 15.0', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\\\"|timeout /T 15.0\",\"email\":\"milovik@entesting.com\"}'),
(566, 'register_duplicate', 'milovik\'&timeout /T 15.0&\'', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\'&timeout /T 15.0&\'\",\"email\":\"milovik@entesting.com\"}'),
(567, 'register_duplicate', 'milovik\'|timeout /T 15.0', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\'|timeout /T 15.0\",\"email\":\"milovik@entesting.com\"}'),
(568, 'register_duplicate', 'get-help', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"get-help\",\"email\":\"milovik@entesting.com\"}'),
(569, 'register_duplicate', 'milovik;get-help', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik;get-help\",\"email\":\"milovik@entesting.com\"}'),
(570, 'register_duplicate', 'milovik\";get-help', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\\\";get-help\",\"email\":\"milovik@entesting.com\"}'),
(571, 'register_duplicate', 'milovik\';get-help', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\';get-help\",\"email\":\"milovik@entesting.com\"}'),
(572, 'register_duplicate', 'milovik;get-help #', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik;get-help #\",\"email\":\"milovik@entesting.com\"}'),
(573, 'register_duplicate', 'milovik;start-sleep -s 15.0', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik;start-sleep -s 15.0\",\"email\":\"milovik@entesting.com\"}'),
(574, 'register_duplicate', 'milovik\";start-sleep -s 15.0', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\\\";start-sleep -s 15.0\",\"email\":\"milovik@entesting.com\"}'),
(575, 'register_duplicate', 'milovik\';start-sleep -s 15.0', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\';start-sleep -s 15.0\",\"email\":\"milovik@entesting.com\"}'),
(576, 'register_duplicate', 'milovik;start-sleep -s 15.0 #', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik;start-sleep -s 15.0 #\",\"email\":\"milovik@entesting.com\"}'),
(577, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(578, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(579, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(580, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(581, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(582, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(583, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(584, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(585, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(586, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(587, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(588, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(589, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(590, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(591, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(592, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(593, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(594, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(595, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(596, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(597, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(598, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(599, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(600, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(601, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(602, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(603, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(604, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(605, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(606, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(607, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(608, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(609, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(610, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(611, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(612, 'register_duplicate', 'milovik', '2025-11-12 03:57:48', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"cat /etc/passwd\"}'),
(613, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com&cat /etc/passwd&\"}'),
(614, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com;cat /etc/passwd;\"}'),
(615, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\"&cat /etc/passwd&\\\"\"}'),
(616, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\";cat /etc/passwd;\\\"\"}'),
(617, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\'&cat /etc/passwd&\'\"}'),
(618, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\';cat /etc/passwd;\'\"}'),
(619, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com&sleep 15.0&\"}'),
(620, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com;sleep 15.0;\"}'),
(621, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\"&sleep 15.0&\\\"\"}'),
(622, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\";sleep 15.0;\\\"\"}'),
(623, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\'&sleep 15.0&\'\"}'),
(624, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\';sleep 15.0;\'\"}'),
(625, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"type %SYSTEMROOT%\\\\win.ini\"}'),
(626, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com&type %SYSTEMROOT%\\\\win.ini\"}'),
(627, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com|type %SYSTEMROOT%\\\\win.ini\"}'),
(628, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\"&type %SYSTEMROOT%\\\\win.ini&\\\"\"}'),
(629, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\"|type %SYSTEMROOT%\\\\win.ini\"}'),
(630, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\'&type %SYSTEMROOT%\\\\win.ini&\'\"}'),
(631, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\'|type %SYSTEMROOT%\\\\win.ini\"}'),
(632, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com&timeout /T 15.0\"}'),
(633, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com|timeout /T 15.0\"}'),
(634, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\"&timeout /T 15.0&\\\"\"}'),
(635, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\"|timeout /T 15.0\"}'),
(636, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\'&timeout /T 15.0&\'\"}'),
(637, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\'|timeout /T 15.0\"}'),
(638, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"get-help\"}'),
(639, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com;get-help\"}'),
(640, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\";get-help\"}'),
(641, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\';get-help\"}'),
(642, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com;get-help #\"}'),
(643, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com;start-sleep -s 15.0\"}'),
(644, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\\\";start-sleep -s 15.0\"}'),
(645, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\';start-sleep -s 15.0\"}'),
(646, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com;start-sleep -s 15.0 #\"}'),
(647, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(648, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}');
INSERT INTO `security_logs` (`id`, `event_type`, `username`, `event_time`, `ip_address`, `details`) VALUES
(649, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(650, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(651, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(652, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(653, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(654, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(655, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(656, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(657, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(658, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(659, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(660, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(661, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(662, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(663, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(664, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(665, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(666, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(667, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(668, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(669, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(670, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(671, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(672, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(673, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(674, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(675, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(676, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(677, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(678, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(679, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(680, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(681, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(682, 'register_duplicate', '\"\'', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"\\\"\'\",\"email\":\"milovik@entesting.com\"}'),
(683, 'register_duplicate', '<!--', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"<!--\",\"email\":\"milovik@entesting.com\"}'),
(684, 'register_duplicate', ']]>', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"]]>\",\"email\":\"milovik@entesting.com\"}'),
(685, 'register_duplicate', 'milovik', '2025-11-12 03:57:49', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(686, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(687, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(688, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"\\\"\'\"}'),
(689, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"<!--\"}'),
(690, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"]]>\"}'),
(691, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(692, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(693, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(694, 'register_duplicate', 'zj 8269*2207 zj', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"zj 8269*2207 zj\",\"email\":\"milovik@entesting.com\"}'),
(695, 'register_duplicate', 'zj{2546*6046}zj', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"zj{2546*6046}zj\",\"email\":\"milovik@entesting.com\"}'),
(696, 'register_duplicate', 'zj${4702*4202}zj', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"zj${4702*4202}zj\",\"email\":\"milovik@entesting.com\"}'),
(697, 'register_duplicate', 'zj#{6414*3693}zj', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"zj#{6414*3693}zj\",\"email\":\"milovik@entesting.com\"}'),
(698, 'register_duplicate', 'zj{#3288*1390}zj', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"zj{#3288*1390}zj\",\"email\":\"milovik@entesting.com\"}'),
(699, 'register_duplicate', 'zj{@2019*2737}zj', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"zj{@2019*2737}zj\",\"email\":\"milovik@entesting.com\"}'),
(700, 'register_duplicate', 'zj{{5204*6784}}zj', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"zj{{5204*6784}}zj\",\"email\":\"milovik@entesting.com\"}'),
(701, 'register_duplicate', 'zj{{=9340*5166}}zj', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"zj{{=9340*5166}}zj\",\"email\":\"milovik@entesting.com\"}'),
(702, 'register_duplicate', 'zj<%=7727*6993%>zj', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"zj<%=7727*6993%>zj\",\"email\":\"milovik@entesting.com\"}'),
(703, 'register_duplicate', 'zj#set($x=3338*4845)${x}zj', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"zj#set($x=3338*4845)${x}zj\",\"email\":\"milovik@entesting.com\"}'),
(704, 'register_duplicate', 'zj<p th:text=\"${3091*1161}\"></p>zj', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"zj<p th:text=\\\"${3091*1161}\\\"></p>zj\",\"email\":\"milovik@entesting.com\"}'),
(705, 'register_duplicate', 'zj{{23740|add:97100}}zj', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"zj{{23740|add:97100}}zj\",\"email\":\"milovik@entesting.com\"}'),
(706, 'register_duplicate', 'zj{{print \"5167\" \"8916\"}}zj', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"zj{{print \\\"5167\\\" \\\"8916\\\"}}zj\",\"email\":\"milovik@entesting.com\"}'),
(707, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(708, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(709, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(710, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(711, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(712, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(713, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(714, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(715, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(716, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(717, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(718, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(719, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(720, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(721, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"zj 1251*2220 zj\"}'),
(722, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"zj{8365*4438}zj\"}'),
(723, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"zj${6530*8127}zj\"}'),
(724, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"zj#{8132*9106}zj\"}'),
(725, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"zj{#5885*6000}zj\"}'),
(726, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"zj{@1949*1756}zj\"}'),
(727, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"zj{{4364*9358}}zj\"}'),
(728, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"zj{{=9122*8348}}zj\"}'),
(729, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"zj<%=4538*7441%>zj\"}'),
(730, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"zj#set($x=9751*3522)${x}zj\"}'),
(731, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"zj<p th:text=\\\"${7719*4422}\\\"></p>zj\"}'),
(732, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"zj{@math key=\\\"7694\\\" method=\\\"multiply\\\" operand=\\\"8729\\\"/}zj\"}'),
(733, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"zj{{62250|add:21330}}zj\"}'),
(734, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"zj{{print \\\"4851\\\" \\\"4907\\\"}}zj\"}'),
(735, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(736, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(737, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(738, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(739, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(740, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(741, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(742, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(743, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(744, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(745, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(746, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(747, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(748, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(749, 'register_duplicate', '<%=%x(sleep 15)%>', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"<%=%x(sleep 15)%>\",\"email\":\"milovik@entesting.com\"}'),
(750, 'register_duplicate', '#{%x(sleep 15)}', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"#{%x(sleep 15)}\",\"email\":\"milovik@entesting.com\"}'),
(751, 'register_duplicate', '{system(\"sleep 15\")}', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"{system(\\\"sleep 15\\\")}\",\"email\":\"milovik@entesting.com\"}'),
(752, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(753, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(754, 'register_duplicate', 'milovik', '2025-11-12 03:57:50', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(755, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(756, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(757, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(758, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(759, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(760, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(761, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(762, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(763, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(764, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"<#assign ex=\\\"freemarker.template.utility.Execute\\\"?new()> ${ ex(\\\"sleep 15\\\") }\"}'),
(765, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"#set($engine=\\\"\\\")\\n#set($proc=$engine.getClass().forName(\\\"java.lang.Runtime\\\").getRuntime().exec(\\\"sleep 15\\\"))\\n#set($null=$proc.waitFor())\\n${null}\"}'),
(766, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"{{= global.process.mainModule.require(\'child_process\').execSync(\'sleep 15\').toString() }}\"}'),
(767, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"<%= global.process.mainModule.require(\'child_process\').execSync(\'sleep 15\').toString()%>\"}'),
(768, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"#{global.process.mainModule.require(\'child_process\').execSync(\'sleep 15\').toString()}\"}'),
(769, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"{{range.constructor(\\\"return eval(\\\\\\\"global.process.mainModule.require(\'child_process\').execSync(\'sleep 15\').toString()\\\\\\\")\\\")()}}\"}'),
(770, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"{{\\\"\\\".__class__.__mro__[1].__subclasses__()[157].__repr__.__globals__.get(\\\"__builtins__\\\").get(\\\"__import__\\\")(\\\"subprocess\\\").check_output(\\\"sleep 15\\\")}}\"}'),
(771, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"${__import__(\\\"subprocess\\\").check_output(\\\"sleep 15\\\", shell=True)}\"}'),
(772, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"{{__import__(\\\"subprocess\\\").check_output(\\\"sleep 15\\\", shell=True)}}\"}'),
(773, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"<%=%x(sleep 15)%>\"}'),
(774, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"#{%x(sleep 15)}\"}'),
(775, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"{system(\\\"sleep 15\\\")}\"}'),
(776, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(777, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(778, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(779, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(780, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(781, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(782, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(783, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(784, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(785, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(786, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(787, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(788, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(789, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(790, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"SAvARxXQOcHwZbcXoIiZpGnYnFPXoLIwAlotUQXUNQDLCpggWGZUoqUBxTfJJBFSmbSHKuGqPZTxOVGdXpsjHNuibLUESXnoeCugfOXGaRHMtKfyMEXEiENYPlVETwoiYmjhxgMGBJEFPCOQmrUoiAndchIcIVIVjTmBWtjOYAVPWTgHMxgAgPDVVwTWndqnTmJHMvmuoxLvZeUAJKWwSmFysYBIKGvMwbSHNcCManDZdQIQvkaLwSrWmLynnhuiHjseWCTVleYksPwUoyUYNbiqnRkdnTBdktKiIglePGWXXXohSXqAABSxUqOSbCGnasWaIhoJyBYLbmDHvmaPXQljlqryNuLmRUyyiNytuVxGNDYwLQVtEkKtXSnYASFCSSxOCsAIuKojSOrBxOXTgMfgFWOhaxDZEBofiICblLyJQyghsVXBuGshLkdyLbccZwIYvWaWGEmtEtbTixTmxkXRouoOdiCflNJbWhWBrcQgWGHBkXthgPAZDmgjvjwWcqxdBEtEVVILXcvKfvLUIJsdSiiVnMjjabnmFmEFLmTDIgeKAXgAfbfcTfZGXoJxVHbNwAroEvvfRofMlNBQsvUZgPcMNnxsibdlWOSbIPtwxabEceOCtvFZcriklasOLstFdWIYfwvotDJHLJnShPDRhXDDsceWlGYaJbPmFoIPYUdBPTfUEnZikoZrBXQdAvYPOdSEbEXMlhetGXIIAbtrgNPnFlfNurjGYtKRYGRPURRTquhbThWgyXffdIPBCwJHYMLdvOcaJXSSgZWOcpGqysRfGDVVyqKBAWKdMrjXvjfWbpWLnwhGgUfvRqNyqqXwpkmdjLnrYdXPmyFMaUlYrtRvGlalfsvTJRAIwoXJvACRnRolRihZIQRtJYdCeGXTFwGoTmSSPVhbHvmkkpQEwhqEWNXwDqtyGSmiGnjZlFhnLRkmwYfTFIYdyoVjunEPANryLaEYNkIosMBIWCJWuErSOIukGhGACsKjqXpQrfdBvKoUTEFDbiZypCvFlyChDaSUSmYdurAGYvnGIHgtDSwOxZwuHsupeMBQJceGPuXxdmZAXRhZoIEcdxvwFVKcuCWUOPDGdSfZCJTrSInHqDxUrouBMhnMbQHlkEIkGFcOobMxNbTBhjVILDHFJcBRNPqFvCVKZPMSUXSjMTQCpCMGHEgChdYVFuedqGTjHxFkPdRKIQtknqZsZugFmTsIZUoKvHGWUhvfPyiXdmDRWvbwaBIjDIjDQretPpkphiAhqWhZLMVQYefooWSsbIakWcwwDSVnRqolFoEHiUGxMHfCuOBCIMbTsbXmLLcwZqJNFcyhiISEZioQlefHqtEtFPFJtTxijCNLxdpdZZoYvpvghBJGhIEWMqCGbEYWSsXWIDSbbYmhFgjsbmRIFoetyvvnHMQHErdUslURvxaZFcnxAQoYCrKbsKLmPeGsMmRooXmbNHBjYTheCrgsELtqnDBfdutoQXhPsCgWhnSlegbmFlrQempfqIBFvrcqspLePhiHkgJqQrMppyGQvcikrMNQkbYXoSoUAJBxvfIkyowTKmDagFPiugMqrGrgWlvKPQBxjBFcerkUiUMDgtbLNGLHIWKIGojAwDpWoYNDTQQxeyMREFosKcadxKgiAdYJHyXtXBvfqkxMVJRZoehxMFYdaZRVUVeJTrGfvcuyVPFjREQbsNZOpgWAGmHnKshODNyfYOQECWWflcMmODYdoAOjPZoGmRukqDpIouFSxyGkvQNKCnQMROhlXUkBJHvZgXsJbDOcVpxqeNSBemNprTvPFGDOdCCUZfvEPMeVsOXnbndcHXMyCQmbkRcfrDUQgNPKveXpijSJXGokUdvBQdSFIpljCUBTpFMjpLHTNJybpfxbMilxAEqhsoHYYMRekAHyQXOWtZfLwbErtccXSdqqAjnKjHEWEMHgKxvuHpCCZwECPtOQNVffWgLakIvoJenPxthmpHyBkOpVIuDbMbLGJMRsUgoRhNFEOaOCjduBiGSvsHMUbiSllWwSlxFQpupapbRehuwJVhsFslBonnTAqaZCpTHGOPhdGvxesrVSkgEZtwaVacJJQgDQlDuOnTko\"}'),
(791, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(792, 'register_duplicate', 'ZAP', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"ZAP\",\"email\":\"milovik@entesting.com\"}'),
(793, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(794, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(795, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(796, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"ZAP\"}'),
(797, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"ZAP%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s%n%s\\n\"}'),
(798, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"ZAP %1!s%2!s%3!s%4!s%5!s%6!s%7!s%8!s%9!s%10!s%11!s%12!s%13!s%14!s%15!s%16!s%17!s%18!s%19!s%20!s%21!n%22!n%23!n%24!n%25!n%26!n%27!n%28!n%29!n%30!n%31!n%32!n%33!n%34!n%35!n%36!n%37!n%38!n%39!n%40!n\\n\"}'),
(799, 'register_duplicate', 'milovik', '2025-11-12 03:57:51', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(800, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(801, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(802, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(803, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(804, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(805, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(806, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(807, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(808, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(809, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"Set-cookie: Tamper=f77a8ac1-5d6e-4937-a5de-cd505ee488d3\"}'),
(810, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"any\\r\\nSet-cookie: Tamper=f77a8ac1-5d6e-4937-a5de-cd505ee488d3\"}'),
(811, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"any?\\r\\nSet-cookie: Tamper=f77a8ac1-5d6e-4937-a5de-cd505ee488d3\"}'),
(812, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"any\\nSet-cookie: Tamper=f77a8ac1-5d6e-4937-a5de-cd505ee488d3\"}'),
(813, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"any?\\nSet-cookie: Tamper=f77a8ac1-5d6e-4937-a5de-cd505ee488d3\"}'),
(814, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"any\\r\\nSet-cookie: Tamper=f77a8ac1-5d6e-4937-a5de-cd505ee488d3\\r\\n\"}'),
(815, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"any?\\r\\nSet-cookie: Tamper=f77a8ac1-5d6e-4937-a5de-cd505ee488d3\\r\\n\"}'),
(816, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(817, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(818, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(819, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(820, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(821, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(822, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(823, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(824, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(825, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(826, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(827, 'register_duplicate', '<', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"<\",\"email\":\"milovik@entesting.com\"}'),
(828, 'register_duplicate', 'system-property(\'xsl:vendor\')/>', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"system-property(\'xsl:vendor\')/>\",\"email\":\"milovik@entesting.com\"}'),
(829, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(830, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(831, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(832, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(833, 'register_duplicate', 'milovik', '2025-11-12 03:57:52', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(834, 'register_duplicate', 'milovik', '2025-11-12 03:57:53', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(835, 'register_duplicate', 'milovik', '2025-11-12 03:57:53', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(836, 'register_duplicate', 'milovik', '2025-11-12 03:57:53', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(837, 'register_duplicate', 'milovik', '2025-11-12 03:57:53', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(838, 'register_duplicate', 'milovik', '2025-11-12 03:57:53', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(839, 'register_duplicate', 'milovik', '2025-11-12 03:57:53', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(840, 'register_duplicate', 'milovik', '2025-11-12 03:57:53', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(841, 'register_duplicate', 'milovik', '2025-11-12 03:57:53', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(842, 'register_duplicate', 'milovik', '2025-11-12 03:57:53', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(843, 'register_duplicate', 'milovik', '2025-11-12 03:57:53', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(844, 'register_duplicate', 'milovik', '2025-11-12 03:57:53', '127.0.0.1', '{\"username\":\"milovik\",\"email\":\"milovik@entesting.com\"}'),
(845, 'login_failed', '\' or 1=1 --', '2025-11-12 04:01:01', '127.0.0.1', '{\"reason\":\"user_not_found\"}'),
(846, 'login_success', 'admin', '2025-11-12 04:10:28', '127.0.0.1', '{\"role\":\"admin\",\"status\":\"Activo\"}'),
(847, 'logout', 'admin', '2025-11-12 04:10:33', '127.0.0.1', '{}'),
(848, 'login_success', 'mgault1se@macromedia.com', '2025-11-12 04:35:32', '127.0.0.1', '{\"role\":\"user\",\"status\":\"Activo\"}'),
(849, 'logout', 'mgault1se@macromedia.com', '2025-11-12 04:36:12', '127.0.0.1', '{}'),
(850, 'login_success', 'admin', '2025-11-12 04:36:15', '127.0.0.1', '{\"role\":\"admin\",\"status\":\"Activo\"}'),
(851, 'logout', 'admin', '2025-11-12 04:36:35', '127.0.0.1', '{}'),
(852, 'login_success', 'admin', '2025-11-12 04:36:43', '127.0.0.1', '{\"role\":\"admin\",\"status\":\"Activo\"}'),
(853, 'logout', 'admin', '2025-11-12 04:37:17', '127.0.0.1', '{}'),
(854, 'login_success', 'audithor', '2025-11-12 04:37:27', '127.0.0.1', '{\"role\":\"audit\",\"status\":\"Activo\"}'),
(855, 'register_success', 'testboot', '2025-11-12 12:15:17', '127.0.0.1', '{\"user_id\":9,\"card_number\":\"87590823612\",\"role_id\":3}'),
(856, 'login_success', 'testboot', '2025-11-12 12:15:27', '127.0.0.1', '{\"role\":\"user\",\"status\":\"Activo\"}'),
(857, 'recharge', 'testboot', '2025-11-12 12:15:44', '127.0.0.1', '{\"amount\":60000,\"kwh\":66.67,\"pin\":\"354229650630407\"}'),
(858, 'logout', 'testboot', '2025-11-12 12:15:48', '127.0.0.1', '{}'),
(859, 'login_success', 'admin', '2025-11-12 12:15:57', '127.0.0.1', '{\"role\":\"admin\",\"status\":\"Activo\"}'),
(860, 'logout', 'admin', '2025-11-12 12:16:40', '127.0.0.1', '{}'),
(861, 'login_success', 'audithor', '2025-11-12 12:16:47', '127.0.0.1', '{\"role\":\"audit\",\"status\":\"Activo\"}'),
(862, 'logout', 'audithor', '2025-11-12 12:17:23', '127.0.0.1', '{}'),
(863, 'login_success', 'admin', '2025-12-03 00:03:34', '127.0.0.1', '{\"role\":\"admin\",\"status\":\"Activo\"}'),
(864, 'logout', 'admin', '2025-12-03 01:02:38', '127.0.0.1', '{}'),
(865, 'login_success', 'audithor', '2025-12-03 01:02:47', '127.0.0.1', '{\"role\":\"audit\",\"status\":\"Activo\"}'),
(866, 'logout', 'audithor', '2025-12-03 01:03:11', '127.0.0.1', '{}'),
(867, 'login_success', 'audithor', '2025-12-03 04:38:37', '127.0.0.1', '{\"role\":\"audit\",\"status\":\"Activo\"}'),
(868, 'login_success', 'audithor', '2025-12-03 04:44:38', '127.0.0.1', '{\"role\":\"audit\",\"status\":\"Activo\"}'),
(869, 'login_success', 'audithor', '2025-12-03 04:48:42', '127.0.0.1', '{\"role\":\"audit\",\"status\":\"Activo\"}'),
(870, 'logout', 'audithor', '2025-12-03 04:48:50', '127.0.0.1', '{}'),
(871, 'login_success', 'admin', '2025-12-03 04:48:52', '127.0.0.1', '{\"role\":\"admin\",\"status\":\"Activo\"}'),
(872, 'logout', 'admin', '2025-12-03 04:48:57', '127.0.0.1', '{}'),
(873, 'login_success', 'audithor', '2025-12-03 04:49:00', '127.0.0.1', '{\"role\":\"audit\",\"status\":\"Activo\"}'),
(874, 'login_success', 'audithor', '2025-12-03 04:57:04', '127.0.0.1', '{\"role\":\"audit\",\"status\":\"Activo\"}');

-- --------------------------------------------------------

--
-- Table structure for table `kwh_price_history`
--

CREATE TABLE `kwh_price_history` (
  `id` int NOT NULL,
  `admin_user_id` int NOT NULL,
  `price_cop` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int NOT NULL,
  `key` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `value` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `statuses`
--

CREATE TABLE `statuses` (
  `id` int NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `statuses`
--

INSERT INTO `statuses` (`id`, `name`, `created_at`) VALUES
(1, 'Activo', '2025-11-12 00:50:04'),
(2, 'Pausa', '2025-11-12 00:50:04'),
(3, 'Deshabilitado', '2025-11-12 00:50:04'),
(4, 'Suspendido', '2025-11-12 00:50:04');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `password_changed_at` timestamp NULL DEFAULT NULL,
  `role_id` int NOT NULL,
  `status_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `email`, `created_at`, `last_login`, `password_changed_at`, `role_id`, `status_id`) VALUES
(1, 'mgault1s', '$2a$10$DcWbvnC4BKJYVsFT6K1mkOpyPwNvpxWuipXWmyVWLbCZRubdarche', 'mgault1s@macromedia.com', '2025-11-11 23:44:30', '2025-11-11 23:50:20', NULL, 3, 1),
(2, 'testuser1', '$2a$10$wcurX.s24i4/Ff4pfnYPruyaTLQoN4QmTSzyICffJZUsw0Cx4BuBa', 'test1@energo.co', '2025-11-11 23:47:15', NULL, NULL, 3, 1),
(3, 'admin', '$2a$10$FBuupFc9CBtsHAzv33GlN.YbyBXrXRVM1EA3/DH/z1aidn24UjDXS', 'admin@energo.co', '2025-11-12 00:21:29', '2025-12-03 04:48:52', NULL, 1, 1),
(5, 'audithor', '$2a$10$tR8XL6iGqX2S8Y9U6/4X2OvTAmne2EC9o3OwSW1smUBwLZoHx0X8m', 'audit@energo.co', '2025-11-12 00:26:04', '2025-12-03 04:57:04', NULL, 2, 1),
(6, 'audithor2', '$2a$10$ryELKq4ePy54l2Qv4M62WeeqlIcI/ALg7M1FeY2mrDCO/PbH/mvj2', 'admin2@energo.co', '2025-11-12 00:28:50', NULL, NULL, 2, 1),
(7, 'mgault1se@macromedia.com', '$2a$10$V6UiSLiWhjAtcjd5ZPB8w.C.DUNYDOLjQtsy3NwZYZUYmQg5ssH2O', 'auditfsdfas@energo2.co', '2025-11-12 01:17:53', '2025-11-12 04:35:32', NULL, 3, 1),
(8, 'milovik', '$2a$10$F5qotwB3DXs1l8jiT2Wu4uh65MmJ5R/qtsifuMlPRgR0monOEfUla', 'milovik@entesting.com', '2025-11-12 03:53:43', '2025-11-12 03:53:57', NULL, 3, 1),
(9, 'testboot', '$2a$10$VVJMIeM9gc2zowHN12CFPuBR2T/Ttqb0vxY/tx0dV.eACrKM70/3a', 'testboot@boot2.com', '2025-11-12 12:15:17', '2025-11-12 12:15:27', NULL, 3, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `employee_codes`
--
ALTER TABLE `employee_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `fk_employee_codes_role` (`role_id`),
  ADD KEY `fk_employee_codes_usage` (`employee_usage_id`);

--
-- Indexes for table `employee_code_usages`
--
ALTER TABLE `employee_code_usages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_employee_code_usages_code` (`employee_code_id`),
  ADD KEY `fk_employee_code_usages_user` (`user_id`);

--
-- Indexes for table `energy_cards`
--
ALTER TABLE `energy_cards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `card_number` (`card_number`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `recharge_pins`
--
ALTER TABLE `recharge_pins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `card_number` (`card_number`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `security_logs`
--
ALTER TABLE `security_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key` (`key`);

--
-- Indexes for table `kwh_price_history`
--
ALTER TABLE `kwh_price_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_user_id` (`admin_user_id`);

--
-- Indexes for table `statuses`
--
ALTER TABLE `statuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_role` (`role_id`),
  ADD KEY `idx_users_status` (`status_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `employee_codes`
--
ALTER TABLE `employee_codes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `employee_code_usages`
--
ALTER TABLE `employee_code_usages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `energy_cards`
--
ALTER TABLE `energy_cards`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `recharge_pins`
--
ALTER TABLE `recharge_pins`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `security_logs`
--
ALTER TABLE `security_logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=875;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `statuses`
--
ALTER TABLE `statuses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

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
  ADD CONSTRAINT `energy_cards_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `recharge_pins`
--
ALTER TABLE `recharge_pins`
  ADD CONSTRAINT `recharge_pins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `recharge_pins_ibfk_2` FOREIGN KEY (`card_number`) REFERENCES `energy_cards` (`card_number`);

--
-- Constraints for table `kwh_price_history`
--
ALTER TABLE `kwh_price_history`
  ADD CONSTRAINT `fk_kwh_price_history_admin` FOREIGN KEY (`admin_user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_users_status` FOREIGN KEY (`status_id`) REFERENCES `statuses` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
