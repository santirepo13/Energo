import { Request, Response, NextFunction } from 'express';
import { logSecurityEvent } from '../config/security';
import { Pool } from 'mysql2/promise';
import { getClientIP } from '../config/security';
import { getDatabaseFunction, DatabaseFunction } from '../database/databasePool';
import { UserRepository } from '../repositories/userRepository';

console.log('Cargando middleware de autenticación');

export interface AuthMiddlewareOptions {
  pool: Pool | DatabaseFunction;
}

export const createAuthMiddleware = ({ pool }: AuthMiddlewareOptions) => {
  // Create database function using the abstraction
  const dbFunction = typeof pool === 'function' ? pool : getDatabaseFunction();
  const userRepository = new UserRepository(dbFunction);
  
  return {
    requireAuth: async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req.session as any)?.userId as number | undefined;
      if (!userId) {
        return res.status(401).json({ error: 'No autorizado' });
      }
      
      try {
        const info = await userRepository.getUserRoleStatusById(userId);
        if (!info) {
          return res.status(401).json({ error: 'No autorizado' });
        }
        
        const status = (info.status_name ?? null) as string | null;
        if (status === 'Deshabilitado' || status === 'Suspendido') {
          return res.status(403).json({ error: `Cuenta ${status}. Contacte al administrador.` });
        }
        
        (req as any).user = { id: userId, role: info.role_name, status };
        next();
      } catch (e) {
        console.error('Falló la verificación de autenticación', e);
        return res.status(500).json({ error: 'Falló la verificación de autenticación' });
      }
    },
    
    requireAdmin: async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req.session as any)?.userId as number | undefined;
      if (!userId) {
        return res.status(401).json({ error: 'No autorizado' });
      }
      
      try {
        const info = await userRepository.getUserRoleStatusById(userId);
        if (!info) {
          return res.status(401).json({ error: 'No autorizado' });
        }
        
        const status = (info.status_name ?? null) as string | null;
        if (status === 'Deshabilitado' || status === 'Suspendido') {
          return res.status(403).json({ error: `Cuenta ${status}. Contacte al administrador.` });
        }
        
        if (info.role_name !== 'admin') {
          return res.status(403).json({ error: 'Solo administradores' });
        }
        
        (req as any).user = { id: userId, role: info.role_name, status };
        next();
      } catch (e) {
        console.error('Falló la verificación de autenticación de administrador', e);
        return res.status(500).json({ error: 'Falló la verificación de autenticación de administrador' });
      }
    },
    
    requireAudit: async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req.session as any)?.userId as number | undefined;
      if (!userId) {
        return res.status(401).json({ error: 'No autorizado' });
      }
      
      try {
        const info = await userRepository.getUserRoleStatusById(userId);
        if (!info) {
          return res.status(401).json({ error: 'No autorizado' });
        }
        
        const status = (info.status_name ?? null) as string | null;
        if (status === 'Deshabilitado' || status === 'Suspendido') {
          return res.status(403).json({ error: `Cuenta ${status}. Contacte al administrador.` });
        }
        
        if (info.role_name !== 'audit') {
          return res.status(403).json({ error: 'Solo auditoría' });
        }
        
        (req as any).user = { id: userId, role: info.role_name, status };
        next();
      } catch (e) {
        console.error('Falló la verificación de autenticación de auditoría', e);
        return res.status(500).json({ error: 'Falló la verificación de autenticación de auditoría' });
      }
    },
  };
};