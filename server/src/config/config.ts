export interface AppConfig {
  port: number;
  host: string;
  clientOrigin: string | string[];
  sessionSecret: string;
  stsMasterKey: string;
  database: {
    host: string;
    name: string;
    username: string;
    password: string;
  };
}

export const loadAppConfig = (): AppConfig => {
  const clientOrigin = process.env.CLIENT_ORIGIN;
  if (!clientOrigin) {
    throw new Error('CLIENT_ORIGIN environment variable is required');
  }
  const origins = clientOrigin.split(',').map(s => s.trim()).filter(s => s);
  
  const config = {
    port: Number(process.env.PORT || 4000),
    host: process.env.HOST || '0.0.0.0',
    clientOrigin: origins.length > 1 ? origins : origins[0],
    sessionSecret: process.env.SESSION_SECRET || 'insecure-dev-secret',
    stsMasterKey: process.env.STS_MASTER_KEY || process.env.SESSION_SECRET || 'insecure-dev-sts-key',
    database: {
      host: process.env.DB_HOST || 'localhost',
      name: process.env.DB_NAME || 'ener-go',
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    },
  };
  
  console.log('Cargando configuración de la aplicación:', config);
  return config;
};