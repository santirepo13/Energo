# Backend API Architecture and Frontend Integration

## Overview

Energo is a full-stack web application for energy card management and recharging. This document explains the backend API architecture, security measures, and how it connects to the React frontend.

## Architecture Overview

### Backend Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MySQL with stored procedures
- **Authentication**: Session-based with Express Session
- **Security**: Helmet, CORS, bcrypt, rate limiting
- **ORM**: MySQL2 with connection pooling

### Frontend Stack
- **Framework**: React with TypeScript
- **Routing**: React Router v6
- **Styling**: Material-UI (MUI)
- **HTTP Client**: Axios
- **State Management**: React Context + Local Storage

## Backend API Structure

### Core Components

#### 1. Application Entry Point (`server/src/app.ts`)
The main application orchestrates all middleware, routes, and services:

```typescript
export class App {
  private app: express.Application;
  private dbConnection: DatabaseConnection;

  constructor() {
    this.app = express();
    this.dbConnection = new DatabaseConnection();
  }
}
```

**Key Features:**
- Database connection management
- Middleware initialization
- Route registration
- Error handling setup

#### 2. Configuration System (`server/src/config/`)

**App Configuration** (`config.ts`):
- Environment-based configuration loading
- Database connection settings
- Security keys and secrets
- CORS origin management

**Database Configuration** (`database.ts`):
- Connection pool setup
- Character set normalization (utf8mb4)
- Connection limits and timeouts

**Security Configuration** (`security.ts`):
- Security headers (XSS, CSRF protection)
- CORS policy enforcement
- Security event logging

#### 3. Middleware Layer (`server/src/middleware/`)

**Authentication Middleware** (`auth.ts`):
```typescript
export const createAuthMiddleware = ({ pool }: AuthMiddlewareOptions) => {
  return {
    requireAuth: async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req.session as any)?.userId as number | undefined;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      // Validate user status and role
      next();
    }
  }
}
```

**Security Middleware**:
- Rate limiting (100 requests per 15 minutes)
- Input validation
- Error handling
- Security headers

#### 4. Service Layer (`server/src/services/`)

**Auth Service** (`authService.ts`):
- User registration and login
- Password policy enforcement
- Password hashing with bcrypt
- Session management

**User Service** (`userService.ts`):
- Profile management
- Personal data validation
- Status updates (Active, Paused, Disabled)
- Document change tracking

**Energy Card Service** (`energyCardService.ts`):
- Card linking and management
- Balance updates
- Card release functionality

**Recharge Service** (`rechargeService.ts`):
- STS-20 token generation
- Balance calculations
- Transaction history

#### 5. Data Access Layer (`server/src/repositories/`)

Database repositories handle direct database operations:
- User repository
- Energy card repository  
- Recharge repository

#### 6. Routes (`server/src/routes/`)

**Auth Routes** (`authRoutes.ts`):
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - Session termination

**User Routes** (`userRoutes.ts`):
- `GET /api/me/profile` - Get user profile
- `PUT /api/me/profile` - Update profile
- `POST /api/me/password-change` - Change password
- `POST /api/me/status` - Update account status

**Energy Card Routes** (`energyCardRoutes.ts`):
- `GET /api/me/meters` - List user's meters
- `POST /api/me/meters` - Add new meter
- `DELETE /api/me/meters/:card_number` - Release meter
- `PATCH /api/me/meters/:card_number` - Update meter name

**Recharge Routes** (`rechargeRoutes.ts`):
- `POST /api/recharge` - Create recharge transaction
- `GET /api/recharge/history` - Get recharge history

## Security Architecture

### Authentication & Authorization

**Session-Based Authentication**:
- Uses Express Session with MySQL store
- Secure session cookies (httpOnly, sameSite=lax)
- Session validation on every protected route

**Role-Based Access Control**:
- Three user roles: `user`, `admin`, `audit`
- Middleware enforces role requirements
- Status validation (Active, Paused, Disabled, Suspended)

**Password Security**:
- bcrypt hashing with salt rounds
- Password policy enforcement (12+ chars, 3 character classes)
- No spaces, no username/email in password

### API Security

**CORS Configuration**:
```typescript
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = Array.isArray(config.clientOrigin) 
      ? config.clientOrigin 
      : [config.clientOrigin];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

**Security Headers** (Helmet):
- Content Security Policy
- X-Content-Type-Options
- X-Frame-Options
- XSS protection

**Rate Limiting**:
- 100 requests per 15 minutes per IP
- Prevents brute force attacks

### Database Security

**Stored Procedures**:
- All database operations use stored procedures
- Parameterized queries prevent SQL injection
- Centralized business logic

**Connection Pooling**:
- MySQL connection pool with limits
- Automatic connection management
- Character set normalization

## Frontend Architecture

### API Client (`src/api/client.ts`)

The frontend uses a centralized Axios client for all API communication:

```typescript
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});
```

**Key Features**:
- Automatic credential inclusion
- Environment-based base URL
- Type-safe API methods
- Consistent error handling

### Authentication Flow

1. **Login Process**:
   ```typescript
   export async function login(data: LoginRequest) {
     const res = await api.post('/api/auth/login', data);
     return res.data as { message: string };
   }
   ```

2. **Session Management**:
   - Cookies automatically handled by browser
   - Session validation on page load
   - Automatic logout on session expiry

3. **Protected Routes**:
   - Authentication middleware checks session
   - Role-based route access
   - Automatic redirects for unauthorized access

### Component Architecture

**Main App Component** (`src/App.tsx`):
- Centralized authentication state
- Route protection logic
- Profile completion validation
- Navigation and layout

**Authentication State Management**:
```typescript
const [authenticated, setAuthenticated] = useState<boolean | null>(null)
const [currentUser, setCurrentUser] = useState<UserInfo | null>(null)
```

**Profile Completion Flow**:
- Validates personal data completion
- Blocks access to dashboard until profile is filled
- Cross-tab synchronization using BroadcastChannel

## Data Flow

### User Registration Flow

1. **Frontend**: User fills registration form
2. **API Call**: `POST /api/auth/register`
3. **Backend**: 
   - Validate input data
   - Hash password with bcrypt
   - Create user record
   - Link energy card
   - Return success response
4. **Frontend**: Redirect to login

### Login Flow

1. **Frontend**: User enters credentials
2. **API Call**: `POST /api/auth/login`
3. **Backend**:
   - Validate credentials
   - Create session
   - Set session cookies
   - Return success
4. **Frontend**: Redirect to dashboard

### Recharge Flow

1. **Frontend**: User selects amount/kWh and meter
2. **API Call**: `POST /api/recharge`
3. **Backend**:
   - Validate user permissions
   - Calculate balance updates
   - Generate STS-20 token
   - Update database
   - Return token and new balance
4. **Frontend**: Display token and updated balance

## Error Handling

### Backend Error Handling

**Global Error Middleware**:
```typescript
app.use(errorHandlerMiddleware.errorHandler);
app.use(errorHandlerMiddleware.notFoundHandler);
```

**Structured Error Responses**:
- Consistent error format
- Appropriate HTTP status codes
- Security-conscious error messages

### Frontend Error Handling

**Axios Interceptors**:
- Automatic error response parsing
- Session expiry detection
- User-friendly error messages

**Component-Level Error Boundaries**:
- Graceful error recovery
- User notification system

## Development Environment

### Backend Setup

**Environment Variables** (`.env.linux`):
```
PORT=4000
HOST=0.0.0.0
CLIENT_ORIGIN=http://0.0.0.0:5173,http://192.168.2.24:5173,http://localhost:5173
SESSION_SECRET=your-secret-key
DB_HOST=localhost
DB_NAME=ener-go
DB_USER=root
DB_PASSWORD=your-password
STS_MASTER_KEY=your-sts-key
```

**Database Setup**:
- Run SQL migrations
- Import stored procedures
- Set up connection pool

### Frontend Setup

**Environment Variables** (`.env.local.home`):
```
VITE_API_BASE_URL=http://localhost:4000
```

**Development Server**:
- Vite development server
- Hot module replacement
- Proxy configuration for API calls

## Production Considerations

### Security Hardening

**Backend**:
- HTTPS enforcement
- Secure session configuration
- Production CORS settings
- Database connection security

**Frontend**:
- Content Security Policy
- Secure cookie handling
- Input validation

### Performance Optimization

**Backend**:
- Database connection pooling
- Query optimization
- Caching strategies
- Rate limiting

**Frontend**:
- Code splitting
- Lazy loading
- Bundle optimization
- Image optimization

## API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/logout` | Session logout | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/me/profile` | Get user profile | Yes |
| PUT | `/api/me/profile` | Update profile | Yes |
| POST | `/api/me/password-change` | Change password | Yes |
| POST | `/api/me/status` | Update account status | Yes |

### Energy Card Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/me/meters` | List user's meters | Yes |
| POST | `/api/me/meters` | Add new meter | Yes |
| DELETE | `/api/me/meters/:card_number` | Release meter | Yes |
| PATCH | `/api/me/meters/:card_number` | Update meter name | Yes |

### Recharge Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/recharge` | Create recharge | Yes |
| GET | `/api/recharge/history` | Get recharge history | Yes |

## Conclusion

The Energo application demonstrates a well-architected full-stack system with:

- **Security-first design** with multiple layers of protection
- **Type-safe API contracts** between frontend and backend
- **Robust authentication** and authorization system
- **Comprehensive error handling** and user experience
- **Scalable architecture** suitable for production deployment

The separation of concerns, consistent patterns, and security measures make this a solid foundation for energy management applications.