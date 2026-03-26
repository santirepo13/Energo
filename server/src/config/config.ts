export interface AppConfig {
  port: number;
  host: string;
  clientOrigin: string | string[];
  sessionSecret: string;
  defaultCostPerKwh: number;
  stsMasterKey: string;
}

export const loadAppConfig = (): AppConfig => {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://0.0.0.0:5173';
  const origins = clientOrigin.split(',').map(s => s.trim()).filter(s => s);
  
  const config = {
    port: Number(process.env.PORT || 4000),
    host: process.env.HOST || '0.0.0.0',
    clientOrigin: origins.length > 1 ? origins : origins[0],
    sessionSecret: process.env.SESSION_SECRET || 'insecure-dev-secret',
    defaultCostPerKwh: 861.88,
    stsMasterKey: process.env.STS_MASTER_KEY || process.env.SESSION_SECRET || 'insecure-dev-sts-key',
  };
  
  console.log('Loading app config:', config);
  return config;
};