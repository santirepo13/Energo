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

export class App {
  private app: express.Application;
  private dbConnection: DatabaseConnection;

  constructor() {
    this.app = express();
    this.dbConnection = new DatabaseConnection();
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  private initializeMiddleware(): void {
    const config = loadAppConfig();

    this.app.use(helmet());
    this.app.use(cors({
      origin: config.clientOrigin,
      credentials: true
    }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    }));
    const rateLimitMiddleware = createRateLimitMiddleware({windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests from this IP'});
    this.app.use(rateLimitMiddleware.rateLimit);
    const errorHandlerMiddleware = createErrorHandlerMiddleware();
    this.app.use(errorHandlerMiddleware.errorHandler);
    this.app.use(errorHandlerMiddleware.notFoundHandler);
  }

  private initializeRoutes(): void {
    const dbPool = this.dbConnection.getPool();
    const authMiddleware = createAuthMiddleware({ pool: dbPool });

    const { AuthService } = require('./services/auth.service');
    const { UserService } = require('./services/user.service');
    const { EnergyCardService } = require('./services/energy-card.service');
    const { RechargeService } = require('./services/recharge.service');

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
    
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }

  async stop(): Promise<void> {
    await this.dbConnection.close();
  }
}