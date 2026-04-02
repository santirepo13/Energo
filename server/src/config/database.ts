import mysql from 'mysql2/promise';

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

export const createDatabasePool = (config: DatabaseConfig): mysql.Pool => {
  return mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port,
    charset: config.charset,
    waitForConnections: config.waitForConnections,
    connectionLimit: config.connectionLimit,
    queueLimit: config.queueLimit,
    decimalNumbers: true,
  });
};

export const normalizeConnectionCollation = (pool: mysql.Pool): void => {
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
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const portRaw = process.env.DB_PORT;

  if (!host) throw new Error('Missing DB_HOST');
  if (!user) throw new Error('Missing DB_USER');
  if (!password) throw new Error('Missing DB_PASSWORD');
  if (!database) throw new Error('Missing DB_NAME');
  if (!portRaw) throw new Error('Missing DB_PORT');

  const port = Number(portRaw);
  if (Number.isNaN(port)) throw new Error('DB_PORT must be a valid number');

  return {
    host,
    user,
    password,
    database,
    port,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
};