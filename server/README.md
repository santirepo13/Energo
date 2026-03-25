# Energo API

A Node.js/Express API for energy card management and recharge system.

## Architecture

The application follows a layered architecture:

```
server/
├── src/
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── models/           # Data models
│   ├── services/         # Business logic
│   ├── repositories/     # Data access layer
│   ├── routes/           # API endpoints
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   ├── database/         # Database connection
│   ├── tests/            # Test files
│   ├── app.ts            # Main application setup
│   └── server.ts         # Application entry point
└── docs/                # Documentation
```

## Features

- User authentication and authorization
- Energy card management
- Recharge system with secure PIN generation
- Role-based access control
- Input validation and sanitization
- Rate limiting
- Comprehensive error handling

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. Start the application:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/me/profile` - Get user profile
- `PUT /api/me/profile` - Update user profile
- `POST /api/me/password-change` - Change password
- `POST /api/me/status` - Update account status

### Energy Cards
- `GET /api/me/meters` - Get user's energy cards
- `POST /api/me/meters` - Add energy card
- `DELETE /api/me/meters/:card_number` - Release energy card
- `PATCH /api/me/meters/:card_number` - Update card name

### Recharge
- `POST /api/recharge` - Recharge energy card
- `GET /api/recharge/history` - Get recharge history

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- Rate limiting
- Session management
- Security logging

## Database

The application uses MySQL with the following key features:

- Connection pooling
- Collation normalization
- Stored procedures for complex operations
- Parameterized queries

## Testing

Run tests with:
```bash
npm test
```

## Configuration

Configuration is managed through environment variables:

- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database credentials
- `PORT` - Server port
- `SESSION_SECRET` - Session encryption key
- `STS_MASTER_KEY` - STS token encryption key

## Development

### Prerequisites

- Node.js 16+
- MySQL 5.7+
- TypeScript

### Scripts

- `npm start` - Start the application
- `npm run dev` - Start in development mode
- `npm test` - Run tests
- `npm run build` - Build for production

## License

MIT License