export interface AppConfig {
  port: number;
  host: string;
  clientOrigin: string;
  sessionSecret: string;
  defaultCostPerKwh: number;
  stsMasterKey: string;
}

export const loadAppConfig = (): AppConfig => {
  return {
    port: Number(process.env.PORT || 4000),
    host: process.env.HOST || '0.0.0.0',
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://0.0.0.0:5173',
    sessionSecret: process.env.SESSION_SECRET || 'insecure-dev-secret',
    defaultCostPerKwh: 861.88,
    stsMasterKey: process.env.STS_MASTER_KEY || process.env.SESSION_SECRET || 'insecure-dev-sts-key',
  };
};