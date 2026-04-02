import { Request, Response, NextFunction } from 'express';

console.log('Cargando middleware de autorización');

export interface AuthorizationMiddlewareOptions {
  allowedRoles: string[];
  allowedStatuses?: string[];
}

export const createAuthorizationMiddleware = ({ allowedRoles, allowedStatuses }: AuthorizationMiddlewareOptions) => {
  return {
    authorize: (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: 'No autorizado' });
      }
      
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Permisos insuficientes' });
      }
      
      if (allowedStatuses && !allowedStatuses.includes(user.status)) {
        return res.status(403).json({ error: `Estado ${user.status} no permitido para esta operación` });
      }
      
      next();
    },
  };
};