import { Request, Response, NextFunction } from 'express';

console.log('Loading error handler middleware');

export const createErrorHandlerMiddleware = () => {
  return {
    errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('Unhandled error:', err);
      
      if (err && err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }
      

      res.status(500).json({ error: 'Internal server error' });
    },
    
    notFoundHandler: (req: Request, res: Response) => {
      res.status(404).json({ error: 'Not found' });
    },
  };
};