console.log('Cargando tipos');

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

export interface AppConfig {
  port: number;
  host: string;
  clientOrigin: string;
  sessionSecret: string;
  stsMasterKey: string;
}

export interface AuthMiddlewareOptions {
  pool: any;
}

export interface ValidationMiddlewareOptions {
  schemas: any;
}

export interface SecurityLog {
  id: number;
  event_type: string;
  username: string | null;
  ip: string;
  details: string;
  created_at: Date;
}