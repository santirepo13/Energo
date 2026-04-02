import { Request, Response, NextFunction } from 'express';

console.log('Cargando middleware de límite de tasa');

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
}

export const createRateLimitMiddleware = (options: RateLimitOptions) => {
  // Temporarily disabled: IP-based rate limiting causes issues in local development
  // and when client IP detection is unreliable. Will be re-enabled in the future
  // when IP scanning is properly implemented.
  return {
    rateLimit: (req: Request, res: Response, next: NextFunction) => {
      // Skip rate limiting for now
      next();
    },
  };
};