CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR(255) NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expired TIMESTAMP NOT NULL,
  INDEX expired_idx (expired)
);
