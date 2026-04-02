import { Request, Response, NextFunction } from 'express';
import { getDatabaseFunction } from '../database/databasePool';

export interface SecurityConfig {
  clientOrigin: string;
  sessionSecret: string;
  corsCredentials: boolean;
}

export const createSecurityMiddleware = (config: SecurityConfig) => {
  return {
    securityHeaders: (req: Request, res: Response, next: NextFunction) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Content-Security-Policy', "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'; form-action 'none'; font-src 'self' data: https://r2cdn.perplexity.ai");
      next();
    },
    
    blockHiddenFiles: (req: Request, res: Response, next: NextFunction) => {
      let p = req.path || '';
      try { p = decodeURIComponent(p); } catch { /* ignore malformed encodings */ }
      
      if (p.startsWith('/.well-known/')) return next();
      if (/(?:^|\/)\.[^/]/.test(p)) {
        return res.status(404).end();
      }
      next();
    },
    
    cors: () => {
      return {
        origin: config.clientOrigin,
        credentials: config.corsCredentials,
      };
    },
  };
};

export const getClientIP = (req: Request): string => {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
};

export const logSecurityEvent = async (pool: any, eventType: string, username: string | null, ip: string, details: any) => {
  // Create database function using the abstraction
  const dbFunction = getDatabaseFunction();
  
  try {
    const payload = typeof details === 'string' ? details : JSON.stringify(details);
    await dbFunction('CALL sp_security_logs_insert(?, ?, ?, ?)', [eventType, username, ip, payload]);
  } catch (e) {
    console.error('Failed to log security event', e);
  }
};