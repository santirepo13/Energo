import { Request, Response, NextFunction } from 'express';

console.log('Cargando controlador de errores');

export const createErrorHandlerMiddleware = () => {
  return {
    errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('Error no controlado:', err);
      
      if (err && err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ error: 'Carga JSON inválida' });
      }
      
      res.status(500).json({ error: 'Error interno del servidor' });
    },
    
    notFoundHandler: (req: Request, res: Response) => {
      res.status(404).json({ error: 'No encontrado' });
    },
  };
};