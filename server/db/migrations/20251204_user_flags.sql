-- 2025-12-04: Flag when a user has completed personal data

CREATE TABLE IF NOT EXISTS `user_flags` (
  `user_id` INT NOT NULL,
  `personal_data_filled` TINYINT(1) NOT NULL DEFAULT 0,
  `filled_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_flags_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;