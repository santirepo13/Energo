import mysql from 'mysql2/promise';
import { DatabaseConfig } from '../types/types';
import { createDatabasePool, normalizeConnectionCollation, loadDatabaseConfig } from '../config/database';

console.log('Loading database connection');

export class DatabaseConnection {
  private pool: mysql.Pool;

  constructor() {
    const config = loadDatabaseConfig();
    console.log('Database config:', config);
    this.pool = createDatabasePool(config);
    normalizeConnectionCollation(this.pool);
    
    // Test database connection
    this.pool.getConnection()
      .then(conn => {
        console.log('Database connection successful');
        conn.release();
      })
      .catch(err => {
        console.error('Database connection failed:', err);
      });
  }

  getPool(): mysql.Pool {
    return this.pool;
  }

  async getConnection(): Promise<any> {
    return this.pool.getConnection();
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}