import mysql from 'mysql2/promise';
import { DatabaseConfig } from '../types/types';

// Type definitions for our database abstraction
export type DatabaseFunction = (query: string, params?: any[]) => Promise<any[]>;

// Global pool instance
let pool: mysql.Pool | null = null;

// Initialize the database pool
export function initializeDatabase(config: DatabaseConfig): void {
  if (pool) {
    return;
  }
  
  pool = mysql.createPool({
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

  // Apply connection collation normalization
  const __origGetConnection = (pool as any).getConnection.bind(pool);
  (pool as any).getConnection = async () => {
    const conn = await __origGetConnection();
    try {
      await conn.query("SET NAMES utf8mb4 COLLATE utf8mb4_general_ci");
      await conn.query("SET collation_connection = 'utf8mb4_general_ci'");
    } catch (_e) { /* ignore */ }
    return conn;
  };
}

// Database abstraction function that handles connection management
export function getDatabaseFunction(): DatabaseFunction {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }

  return async (query: string, params?: any[]): Promise<any[]> => {
    const conn = await pool!.getConnection();
    try {
      const result = await conn.query(query, params);
      return result;
    } finally {
      conn.release();
    }
  };
}

// Close the database pool
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}