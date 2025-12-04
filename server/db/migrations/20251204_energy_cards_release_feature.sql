-- 2025-12-04: Enable user-releasable meters for re-linking to new accounts without deleting history
START TRANSACTION;

-- Allow energy_cards.user_id to be NULL so a meter can be temporarily unassigned ("released")
ALTER TABLE energy_cards
  MODIFY COLUMN user_id INT NULL;

-- Track release metadata
ALTER TABLE energy_cards
  ADD COLUMN released TINYINT(1) NOT NULL DEFAULT 0 AFTER user_id,
  ADD COLUMN released_by_user_id INT NULL AFTER released,
  ADD COLUMN released_at TIMESTAMP NULL DEFAULT NULL AFTER last_recharge;

-- Index + FK for release metadata
ALTER TABLE energy_cards
  ADD INDEX idx_energy_cards_released_by_user (released_by_user_id),
  ADD CONSTRAINT fk_energy_cards_released_by_user
    FOREIGN KEY (released_by_user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;