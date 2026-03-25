import { Request, Response, NextFunction } from 'express';
import { logSecurityEvent } from '../config/security';
import { Pool } from 'mysql2/promise';

export interface AuthMiddlewareOptions {
  pool: Pool;
}

export const createAuthMiddleware = ({ pool }: AuthMiddlewareOptions) => {
  return {
    requireAuth: async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req.session as any)?.userId as number | undefined;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      try {
        const conn = await pool.getConnection();
        try {
          const info = await callFirst(conn, 'sp_users_select_role_status_by_id', [userId]);
          if (!info) {
            return res.status(401).json({ error: 'Unauthorized' });
          }
          
          const status = (info.status_name ?? null) as string | null;
          if (status === 'Deshabilitado' || status === 'Suspendido') {
            return res.status(403).json({ error: `Cuenta ${status}. Contacte al administrador.` });
          }
          
          (req as any).user = { id: userId, role: info.role_name, status };
          next();
        } finally {
          conn.release();
        }
      } catch (e) {
        console.error('Auth check failed', e);
        return res.status(500).json({ error: 'Auth check failed' });
      }
    },
    
    requireAdmin: async (req: Request, res: Response, next: NextFunction) => {
      const auth = await this.requireAuth(req, res, () => Promise.resolve());
      if (auth instanceof Response) return auth;
      
      if ((req as any).user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin only' });
      }
      next();
    },
    
    requireAudit: async (req: Request, res: Response, next: NextFunction) => {
      const auth = await this.requireAuth(req, res, () => Promise.resolve());
      if (auth instanceof Response) return auth;
      
      if ((req as any).user?.role !== 'audit') {
        return res.status(403).json({ error: 'Audit only' });
      }
      next();
    },
  };
};

async function callFirst<T = any>(conn: any, proc: string, params: any[] = []): Promise<T | null> {
  const sql = `CALL ${proc}(${params.map(() => '?').join(',')})`;
  const [rows]: any = await conn.query(sql, params);
  const firstSet: any = Array.isArray(rows) ? rows[0] : rows;
  return Array.isArray(firstSet) && firstSet.length ? firstSet[0] : null;
}