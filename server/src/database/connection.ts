import mysql from 'mysql2/promise';
import { DatabaseConfig } from '../types/types';
import { createDatabasePool, normalizeConnectionCollation, loadDatabaseConfig } from '../config/database';

export class DatabaseConnection {
  private pool: mysql.Pool;

  constructor() {
    const config = loadDatabaseConfig();
    this.pool = createDatabasePool(config);
    normalizeConnectionCollation(this.pool);
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