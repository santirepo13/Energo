import { Request, Response, NextFunction } from 'express';
import { getUserRoleAndStatus } from '../services/authService';

/**
 * Middleware to require authentication
 * Checks if user is logged in and has valid session
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req.session as any)?.userId as number | undefined;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Also enforce user status on each request in case it changed after login
  getUserRoleAndStatus(userId)
    .then((info) => {
      const status = info?.status || null;
      if (status === 'Deshabilitado' || status === 'Suspendido') {
        return res.status(403).json({ error: `Cuenta ${status}. Contacte al administrador.` });
      }
      return next();
    })
    .catch((_e) => {
      return res.status(500).json({ error: 'Auth check failed' });
    });
}

/**
 * Middleware to require admin role
 * Checks if user has admin privileges
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = (req.session as any)?.userId as number | undefined;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  getUserRoleAndStatus(userId)
