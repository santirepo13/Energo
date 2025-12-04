-- 2025-12-04: Ping procedure for DB health checks (MariaDB 10.x compatible)
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_ping $$
CREATE PROCEDURE sp_ping()
BEGIN
  SELECT 1 AS ok;
END $$

DELIMITER ;