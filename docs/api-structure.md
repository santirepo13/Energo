# Energo API Structure Documentation

## Overview

The Energo API is a Node.js/Express.js backend application that provides RESTful endpoints for an energy management system. The API is structured around user authentication, energy card management, recharge functionality, and administrative operations.

## Project Structure

```
server/
├── src/
│   └── server.ts              # Main application file (entry point)
├── db/
│   └── migrations/           # Database migration files
│       ├── 20251204_stored_procedures.sql
│       ├── 20251204_stored_procedures_collation_fix.sql
│       └── 20251204_sp_ping.sql
├── package.json              # Node.js dependencies
└── tsconfig.json            # TypeScript configuration
```

## Main Application File: server.ts

### Entry Point and Initialization
- **Lines 1-14**: Environment variable loading from multiple locations
- **Lines 15-47**: Express app setup, middleware configuration, and database connection pool
- **Lines 49-58**: Collation normalization for MySQL/MariaDB connections
- **Lines 60-108**: Stored procedure migration system
- **Lines 110-129**: Helper functions for calling stored procedures

### Security Middleware
- **Lines 194-208**: Security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- **Lines 210-232**: CORS and session configuration
- **Lines 235-246**: Hidden file protection

### Database Connection
- Uses MySQL2 promise-based pool
- Connection collation set to `utf8mb4_general_ci` to avoid conflicts
- Automatic stored procedure application on startup

## API Route Structure

### Authentication Routes

#### Public Routes
- **`POST /api/register`** (lines 337-500)
  - User registration with validation
  - Employee code verification for admin/audit roles
  - Energy card linking
  - Password policy enforcement

- **`POST /api/login`** (lines 502-570)
  - User authentication with bcrypt
  - Status-based access control
  - Session management

- **`POST /api/mock/pausa/verify`** (lines 573-611)
  - Mock endpoint for paused account verification

#### Protected Routes
- **`POST /api/logout`** (lines 1124-1131)
- **`GET /api/me/profile`** (lines 1725-1746)
- **`PUT /api/me/profile`** (lines 1748-1855)
- **`POST /api/me/password-change`** (lines 1857-1890)
- **`POST /api/me/status`** (lines 1892-1920)

### Energy Card Management

#### User Routes
- **`GET /api/me/meters`** (lines 1925-1937)
- **`POST /api/me/meters`** (lines 1939-1994)
- **`DELETE /api/me/meters/:card_number`** (lines 1996-2023)
- **`PATCH /api/me/meters/:card_number`** (lines 2034-2068)

#### Admin Routes
- **`POST /api/admin/meters/transfer`** (lines 1214-1263)
- **`POST /api/admin/users/:id/meters/link`** (lines 1390-1451)
- **`DELETE /api/admin/users/:id/meters/:card_number`** (lines 1457-1485)

### Recharge System

#### User Routes
- **`POST /api/recharge`** (lines 1047-1121)
  - STS-style 20-digit token generation
  - Balance and kWh calculations
  - Security logging

#### Admin Routes
- **`GET /api/audit/metrics`** (lines 846-874)
- **`GET /api/audit/recharge-pins-latest`** (lines 355-364)

### Administrative Functions

#### User Management
- **`GET /api/admin/users`** (lines 1134-1145)
- **`GET /api/admin/users/:id`** (lines 1298-1334)
- **`PATCH /api/admin/users/:id/email`** (lines 1148-1180)
- **`PATCH /api/admin/users/:id/status`** (lines 1182-1210)
- **`POST /api/admin/users/:id/send-reset`** (lines 1213-1292)
- **`POST /api/admin/users/:id/suspend`** (lines 1492-1528)
- **`POST /api/admin/users/:id/unsuspend`** (lines 1530-1561)

#### Audit Functions
- **`GET /api/audit/admins`** (lines 674-685)
- **`GET /api/audit/employees`** (lines 688-699)
- **`GET /api/audit/admins/:id`** (lines 732-770)
- **`PUT /api/audit/admins/:id/profile`** (lines 773-843)
- **`GET /api/audit/metrics`** (lines 846-874)
- **`GET /api/audit/employee-codes`** (lines 877-888)
- **`POST /api/audit/employee-codes`** (lines 891-934)

### System Routes

- **`GET /api/health`** (lines 333-335)
- **`GET /api/dashboard`** (lines 936-987)

## Authentication and Authorization

### Middleware Functions

- **`requireAuth`** (lines 624-641)
  - Checks session authentication
  - Verifies user status

- **`requireAdmin`** (lines 643-656)
  - Requires admin role
  - Checks user status

- **`requireAudit`** (lines 658-671)
  - Requires audit role

### Session Management
- Express sessions with secure cookies
- Session data stored in memory
- Session destruction on logout

## Database Integration

### Stored Procedures

The API uses MySQL/MariaDB stored procedures for all database operations:

#### Core Procedures
- **`sp_ping()`** - Health check
- **`sp_settings_get()`** - Get configuration values
- **`sp_settings_upsert_cost_per_kwh()`** - Update cost per kWh

#### User Management
- **`sp_users_find_by_username_or_email()`** - Find user by username/email
- **`sp_users_insert()`** - Insert new user
- **`sp_users_select_login_by_username()`** - Get user for login
- **`sp_users_update_last_login()`** - Update last login timestamp
- **`sp_users_update_password()`** - Update user password
- **`sp_users_update_status_by_name()`** - Update user status

#### Energy Cards
- **`sp_energy_cards_find_by_card_number()`** - Find card by number
- **`sp_energy_cards_select_by_user_and_card_for_update()`** - Select card with lock
- **`sp_energy_cards_update_balance()`** - Update card balance
- **`sp_energy_cards_insert()`** - Insert new card
- **`sp_energy_cards_release_by_user_and_card()`** - Release card

#### Security
- **`sp_security_logs_insert()`** - Insert security log
- **`sp_security_logs_latest()`** - Get latest security logs

### Collation Handling

The application includes comprehensive collation handling:
- Connection collation set to `utf8mb4_general_ci`
- Stored procedures with collation-safe string comparisons
- Raw SQL fallbacks for collation conflicts

## Security Features

### Input Validation
- Password policy enforcement (12+ chars, 3+ character classes)
- Email and username validation
- Card number format validation

### Protection Mechanisms
- SQL injection prevention via stored procedures
- XSS protection via CSP headers
- CSRF protection via SameSite cookies
- Rate limiting (implicit via session management)
- Security logging for all sensitive operations

### Error Handling
- JSON parse error handling
- Database error handling with appropriate status codes
- Security event logging for failures

## Configuration

### Environment Variables
- **`PORT`** - Server port (default: 4000)
- **`HOST`** - Server host (default: 0.0.0.0)
- **`CLIENT_ORIGIN`** - Allowed CORS origin
- **`SESSION_SECRET`** - Session encryption key
- **`STS_MASTER_KEY`** - STS token generation key
- **Database credentials** - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

### Default Values
- Cost per kWh: 861.88 COP
- Session timeout: Browser session
- Password hashing: bcrypt with 10 rounds

## Development and Deployment

### Scripts
- **`npm run dev`** - Development with hot reload
- **`npm run build`** - TypeScript compilation
- **`npm start`** - Production start

### Dependencies
- Express.js for web framework
- MySQL2 for database connectivity
- bcryptjs for password hashing
- cors for cross-origin requests
- express-session for session management

## API Design Principles

### RESTful Architecture
- Resource-based endpoints
- HTTP method semantics (GET, POST, PUT, DELETE, PATCH)
- JSON request/response format

### Error Handling
- Consistent error response format
- Appropriate HTTP status codes
- Detailed error messages for debugging

### Security First
- Authentication required for protected endpoints
- Role-based access control
- Comprehensive input validation
- Security headers and protections

### Performance
- Connection pooling for database access
- Stored procedures for efficient queries
- Minimal middleware chain
- Caching opportunities (not implemented but designed for)