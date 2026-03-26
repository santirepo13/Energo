import { validationSchemas } from '../config/validation';

console.log('Loading validation middleware');


export const createValidationMiddleware = () => {
  return {
    validate: (schema: keyof typeof validationSchemas) => {
      return (req: any, res: any, next: any) => {
        const { error } = validationSchemas[schema].validate(req.body);
        if (error) {
          return res.status(400).json({ error: error.details[0].message });
        }
        next();
      };
    },
    
    validateQuery: (schema: keyof typeof validationSchemas) => {
      return (req: any, res: any, next: any) => {
        const { error } = validationSchemas[schema].validate(req.query);
        if (error) {
          return res.status(400).json({ error: error.details[0].message });
        }
        next();
      };
    },
    
    validateParams: (schema: keyof typeof validationSchemas) => {
      return (req: any, res: any, next: any) => {
        const { error } = validationSchemas[schema].validate(req.params);
        if (error) {
          return res.status(400).json({ error: error.details[0].message });
        }
        next();
      };
    },
  };
};