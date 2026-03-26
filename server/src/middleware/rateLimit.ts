import { Request, Response, NextFunction } from 'express';

console.log('Loading rate limit middleware');

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
}

export const createRateLimitMiddleware = (options: RateLimitOptions) => {
  const store = new Map();
  
  return {
    rateLimit: (req: Request, res: Response, next: NextFunction) => {
      const key = req.ip || '127.0.0.1';
      const now = Date.now();
      const windowStart = Math.floor(now / options.windowMs) * options.windowMs;
      
      let windowData = store.get(key);
      if (!windowData) {
        windowData = { windows: new Map() };
        store.set(key, windowData);
      }
      
      let windowCount = windowData.windows.get(windowStart) || 0;
      if (windowCount >= options.max) {
        return res.status(429).json({ error: options.message });
      }
      
      windowData.windows.set(windowStart, windowCount + 1);
      next();
    },
  };
};