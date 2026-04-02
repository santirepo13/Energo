# Validation Schemas

This document describes the validation schemas used throughout the application for request data validation.

## Overview

All API endpoints that receive data from clients must validate the input using the schemas defined in `validation.ts`. These schemas ensure data integrity and security by enforcing required fields, data types, and business rules.

## Available Schemas

### 1. Register
Validates user registration data:
- `username`: String, 3-50 characters, required
- `password`: String, minimum 12 characters, required
- `email`: Valid email format, required
- `card_number`: String, optional
- `employee_code`: String, optional

### 2. Login
Validates user login credentials:
- `username`: String, required
- `password`: String, required

### 3. Recharge
Validates recharge requests with mutual exclusivity:
- `amount`: Number, minimum 0, optional
- `kwh`: Number, minimum 0, optional
- `card_number`: String, optional
- `pin_code`: String, optional

**Note**: Only one of `amount`, `kwh`, or `pin_code` must be provided.

### 4. Password Change
Validates password change requests:
- `current_password`: String, required
- `new_password`: String, minimum 12 characters, required

### 5. Profile Update
Validates user profile updates:
- `primer_nombre`: String, required
- `primer_apellido`: String, required
- `tipo_identificacion`: String, required
- `numero_identificacion`: String, required
- `segundo_nombre`: String, optional
- `segundo_apellido`: String, optional
- `direccion`: String, optional
- `telefono`: String, optional

### 6. Admin User Update
Validates admin user status updates:
- `email`: Valid email format, optional
- `status`: String, must be one of: 'Activo', 'Pausa', 'Deshabilitado', 'Suspendido', optional

### 7. KWH Price Update
Validates KWH price updates:
- `price`: Number, minimum 0, required

### 8. Employee Code
Validates employee code requests:
- `role`: String, must be 'admin' or 'audit', required

### 9. Password Reset
Validates password reset requests:
- `token`: String, required
- `new_password`: String, minimum 12 characters, required

### 10. Status Update
Validates status updates:
- `status`: String, must be 'Pausa' or 'Deshabilitado', required

### 11. Meter Link
Validates meter linking requests:
- `card_number`: String, required
- `name`: String, optional

### 12. Meter Update
Validates meter updates:
- `name`: String, optional 

