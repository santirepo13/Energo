-- Migration: create user_profiles (datos personales)
-- Stores nombres, apellidos, identificación, dirección y teléfono por usuario.

CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `primer_nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `segundo_nombre` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `primer_apellido` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `segundo_apellido` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipo_identificacion` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `numero_identificacion` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `telefono` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user` (`user_id`),
  UNIQUE KEY `uniq_documento` (`tipo_identificacion`,`numero_identificacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Document types suggestion (no enforced CHECK to keep compatibility):
-- 'CC','CE','Pasaporte','PEP','RIF'

ALTER TABLE `user_profiles`
  ADD CONSTRAINT `fk_user_profiles_user`
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;