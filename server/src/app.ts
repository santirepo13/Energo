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
import { loadAppConfig } from './config/config';
import { Sequelize } from 'sequelize';
import connectSessionSequelize from 'connect-session-sequelize';

console.log('Loading app');

export class App {
  private app: express.Application;
  private dbConnection: DatabaseConnection;

  constructor() {
    this.app = express();
    this.dbConnection = new DatabaseConnection();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private async initializeMiddleware(): Promise<void> {
    const config = loadAppConfig();

    this.app.use(helmet());
    this.app.use(cors({
      origin: config.clientOrigin,
      credentials: true
    }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    const sequelize = new Sequelize({
      dialect: 'mysql',
      host: config.database.host,
      database: config.database.name,
      username: config.database.username,
      password: config.database.password,
      logging: false
    });

    const SequelizeStore = connectSessionSequelize(session.Store);
    const store = new SequelizeStore({
      db: sequelize,
      table: 'sessions',
      expiration: 86400000, // 24 hours
      checkExpirationInterval: 900000 // 15 minutes
    }) as any;

    await store.sync(); // Create sessions table

    this.app.use(session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: store,
      cookie: {
        secure: false, // false for development over HTTP
        httpOnly: true,
        sameSite: 'lax', // Allow cross-site cookies in development
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    }));
    const rateLimitMiddleware = createRateLimitMiddleware({windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests from this IP'});
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
    const userRoutes = createUserRoutes(new UserService(dbPool), authMiddleware);
    const energyCardRoutes = createEnergyCardRoutes(new EnergyCardService(dbPool), authMiddleware);
    const rechargeRoutes = createRechargeRoutes(new RechargeService(dbPool), authMiddleware);

    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/me', userRoutes);
    this.app.use('/api/me/meters', energyCardRoutes);
    this.app.use('/api/recharge', rechargeRoutes);

    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
  }

  async start(): Promise<void> {
    const config = loadAppConfig();
    const port = config.port;
    
    console.log('Starting server...');
    console.log('Config:', config);
    
    this.app.listen(port, () => {
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