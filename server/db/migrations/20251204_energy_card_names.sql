-- Migration: Add 'name' column to energy_cards to store user-defined meter names
-- Run this in MySQL 8+. Safe to re-run.
START TRANSACTION;
ALTER TABLE `energy_cards`
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(100) NULL DEFAULT NULL AFTER `card_number`;
COMMIT;