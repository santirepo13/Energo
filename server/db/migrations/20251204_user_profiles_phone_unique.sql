-- Migration: enforce unique phone numbers in user_profiles
-- Ensures that 'telefono' is unique across all profiles; multiple NULLs allowed

ALTER TABLE `user_profiles`
  ADD UNIQUE KEY `uniq_phone` (`telefono`);