import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import { DatabaseConnection } from './database/connection';
import { createAuthMiddleware } from './middleware/auth';
import { createValidationMiddleware } from './middleware/validation';
import { createErrorHandlerMiddleware } from './middleware/errorHandler';
import { createRateLimitMiddleware } from './middleware/rateLimit';
import { createAuthRoutes } from './routes/authRoutes';
import { createUserRoutes } from './routes/userRoutes';
import { createEnergyCardRoutes } from './routes/energyCardRoutes';
import { createRechargeRoutes } from './routes/rechargeRoutes';
import { createAdminRoutes } from './routes/adminRoutes';
import { loadAppConfig } from './config/config';
import { MySQLSessionStore } from './stores/sessionStore';

console.log('Loading app');

export class App {
  private app: express.Application;
  private dbConnection: DatabaseConnection;

  constructor() {
    this.app = express();
    this.dbConnection = new DatabaseConnection();
  }

  private async initializeMiddleware(): Promise<void> {
    const config = loadAppConfig();
    
    // Build backend origin URL for CSP
    const backendOrigin = `http://${config.host}:${config.port}`;

    // Apply CORS FIRST before any other middleware
    this.app.use(cors({
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
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Apply Helmet AFTER CORS
    this.app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "http://192.168.2.24:5173", backendOrigin],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
    },
  },
}));
;
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    const dbPool = this.dbConnection.getPool();
    const sessionStore = new MySQLSessionStore(dbPool);

    this.app.use(session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        secure: false, // false for development over HTTP
        httpOnly: true,
        sameSite: 'lax', // Allow cross-site cookies in development
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    }));

    const rateLimitMiddleware = createRateLimitMiddleware({windowMs: 15*60*1000, max: 100, message: 'Too many requests'});
    this.app.use(rateLimitMiddleware.rateLimit);
  }

  private initializeRoutes(): void {
    const dbPool = this.dbConnection.getPool();
    const authMiddleware = createAuthMiddleware({ pool: dbPool });

    const { AuthService } = require('./services/authService');
    const { UserService } = require('./services/userService');
    const { EnergyCardService } = require('./services/energyCardService');
    const { RechargeService } = require('./services/rechargeService');

    const authRoutes = createAuthRoutes(new AuthService(dbPool), authMiddleware);
    const userRoutes = createUserRoutes(new UserService(dbPool), authMiddleware, new RechargeService(dbPool));
    const energyCardRoutes = createEnergyCardRoutes(new EnergyCardService(dbPool), authMiddleware);
    const rechargeRoutes = createRechargeRoutes(new RechargeService(dbPool), authMiddleware);
    const adminRoutes = createAdminRoutes(new UserService(dbPool), new EnergyCardService(dbPool), authMiddleware);

    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/me', userRoutes);
    this.app.use('/api/me/meters', energyCardRoutes);
    this.app.use('/api/recharge', rechargeRoutes);
    this.app.use('/api/admin', adminRoutes);
    
    this.app.set('dbPool', dbPool);

    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
  }

  async start(): Promise<void> {
    await this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    const config = loadAppConfig();
    const port = config.port;

    console.log('Starting server...');
    console.log('Config:', config);

    this.app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    console.log('Available routes:');
    console.log('  GET /health');
    console.log('  POST /api/auth/login');
    console.log('  POST /api/auth/register');
    console.log('  POST /api/auth/logout');
    console.log('  GET /api/me/profile');
    console.log('  PUT /api/me/profile');
    console.log('  POST /api/me/password-change');
    console.log('  POST /api/me/status');
    console.log('  GET /api/me/meters');
    console.log('  POST /api/me/meters');
    console.log('  DELETE /api/me/meters/:card_number');
    console.log('  PATCH /api/me/meters/:card_number');
    console.log('  POST /api/recharge');
    console.log('  GET /api/recharge/history');
    console.log('  POST /api/admin/kwh-price');
    });
  }

  async stop(): Promise<void> {
    await this.dbConnection.close();
  }

  private initializeErrorHandling(): void {
    const errorHandlerMiddleware = createErrorHandlerMiddleware();
    this.app.use(errorHandlerMiddleware.errorHandler);
    this.app.use(errorHandlerMiddleware.notFoundHandler);
  }
}