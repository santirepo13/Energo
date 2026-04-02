import mysql from 'mysql2/promise';
import { DatabaseConfig } from '../types/types'; //this is not a bug, this is imported for type checking (part of typescrypt features)
import { createDatabasePool, normalizeConnectionCollation, loadDatabaseConfig } from '../config/database';

console.log('Cargando conexión a base de datos');

export class DatabaseConnection {
  private pool: mysql.Pool;

  constructor() {
    const config = loadDatabaseConfig();
    console.log('Configuración de base de datos:', config);
    this.pool = createDatabasePool(config);
    normalizeConnectionCollation(this.pool);
    
    // Test database connection
    this.pool.getConnection()
      .then(conn => {
        console.log('Conexión a base de datos exitosa');
        conn.release();
      })
      .catch(err => {
        console.error('Falló la conexión a base de datos:', err);
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