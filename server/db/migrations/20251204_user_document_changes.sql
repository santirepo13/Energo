-- 2025-12-04: Track ID document changes and enforce one-time change per user

CREATE TABLE IF NOT EXISTS user_document_changes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  old_tipo VARCHAR(32) NOT NULL,
  old_numero VARCHAR(64) NOT NULL,
  new_tipo VARCHAR(32) NOT NULL,
  new_numero VARCHAR(64) NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_user_document_changes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE UNIQUE INDEX uniq_user_document_changes_user ON user_document_changes(user_id);