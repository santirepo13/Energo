import { Request, Response, NextFunction } from 'express';

export interface AuthorizationMiddlewareOptions {
  allowedRoles: string[];
  allowedStatuses?: string[];
}

export const createAuthorizationMiddleware = ({ allowedRoles, allowedStatuses }: AuthorizationMiddlewareOptions) => {
  return {
    authorize: (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      if (allowedStatuses && !allowedStatuses.includes(user.status)) {
        return res.status(403).json({ error: `Status ${user.status} not allowed for this operation` });
      }
      
      next();
    },
  };
};