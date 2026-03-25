import { Pool } from 'mysql2/promise';

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  charset: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

export const createDatabasePool = (config: DatabaseConfig): Pool => {
  return new Pool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port,
    charset: config.charset,
    waitForConnections: config.waitForConnections,
    connectionLimit: config.connectionLimit,
    queueLimit: config.queueLimit,
  });
};

export const normalizeConnectionCollation = (pool: Pool): void => {
  const __origGetConnection = (pool as any).getConnection.bind(pool);
  (pool as any).getConnection = async () => {
    const conn = await __origGetConnection();
    try {
      await conn.query("SET NAMES utf8mb4 COLLATE utf8mb4_general_ci");
      await conn.query("SET collation_connection = 'utf8mb4_general_ci'");
    } catch (_e) { /* ignore */ }
    return conn;
  };
};

export const loadDatabaseConfig = (): DatabaseConfig => {
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ener-go',
    port: Number(process.env.DB_PORT || 3306),
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
};