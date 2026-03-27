import Joi from 'joi';

console.log('Loading validation schemas');

export const validationSchemas = {
  register: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(12).required(),
    email: Joi.string().email().required(),
    card_number: Joi.string().allow('').optional(),
    employee_code: Joi.string().allow('').optional(),
  }),
  
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),
  
  recharge: Joi.object({
  amount: Joi.number().min(0).optional().custom((value, helpers) => {
    if (typeof value === 'number' && !Number.isFinite(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }),
  kwh: Joi.number().min(0).optional().custom((value, helpers) => {
    if (typeof value === 'number' && !Number.isFinite(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }),
  card_number: Joi.string().optional(),
  pin_code: Joi.string().optional(),
}).xor('amount', 'kwh', 'pin_code').messages({
  'object.xor': 'Debe proporcionar ya sea amount, kwh o pin_code, pero solo uno',
  'any.invalid': 'Value must be a valid number'
}),
  
  passwordChange: Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(12).required(),
  }),
  
  profileUpdate: Joi.object({
    primer_nombre: Joi.string().required(),
    primer_apellido: Joi.string().required(),
    tipo_identificacion: Joi.string().required(),
    numero_identificacion: Joi.string().required(),
    segundo_nombre: Joi.string().optional().allow(null, ''),
    segundo_apellido: Joi.string().optional().allow(null, ''),
    direccion: Joi.string().optional().allow(null, ''),
    telefono: Joi.string().optional().allow(null, ''),
  }),
  
  adminUserUpdate: Joi.object({
    email: Joi.string().email().optional(),
    status: Joi.string().valid('Activo', 'Pausa', 'Deshabilitado', 'Suspendido').optional(),
  }),
  
  kwhPriceUpdate: Joi.object({
    price: Joi.number().min(0).required(),
  }),
  
  employeeCode: Joi.object({
    role: Joi.string().valid('admin', 'audit').required(),
  }),
  
  passwordReset: Joi.object({
    token: Joi.string().required(),
    new_password: Joi.string().min(12).required(),
  }),
  
  statusUpdate: Joi.string().valid('Pausa', 'Deshabilitado').required(),
  
  meterLink: Joi.object({
    card_number: Joi.string().required(),
    name: Joi.string().optional(),
  }),
  
  meterUpdate: Joi.object({
    name: Joi.string().optional(),
  }),
};