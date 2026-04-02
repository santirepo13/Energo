import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { loadAppConfig } from './config/config';
import { createSecurityMiddleware, getClientIP } from './config/security';
import { createErrorHandlerMiddleware } from './middleware/errorHandler';
import { createAuthMiddleware } from './middleware/auth';
import { createAuthRoutes } from './routes/authRoutes';
import { createUserRoutes } from './routes/userRoutes';
import { createAdminRoutes } from './routes/adminRoutes';
import { createAuditRoutes } from './routes/auditRoutes';
import { createEnergyCardRoutes } from './routes/energyCardRoutes';
import { createRechargeRoutes } from './routes/rechargeRoutes';
import { AuthService } from './services/authService';
import { UserService } from './services/userService';
import { AdminService } from './services/adminService';
import { AuditService } from './services/auditService';
import { EnergyCardService } from './services/energyCardService';
import { RechargeService } from './services/rechargeService';
import { MySQLSessionStore } from './stores/sessionStore';
import { initializeDatabase, getDatabaseFunction, closeDatabase } from './database/databasePool';
import { loadDatabaseConfig } from './config/database';

export class App {
  private app: express.Application;
  private port: number;
  private host: string;

  constructor() {
    this.app = express();
    const config = loadAppConfig();
    this.port = config.port;
    this.host = config.host;

    this.initializeServices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private initializeServices(): void {
    const dbConfig = loadDatabaseConfig();
    initializeDatabase(dbConfig);
    const db = getDatabaseFunction();

    const authService = new AuthService(db);
    const userService = new UserService(db);
    const adminService = new AdminService(db);
    const auditService = new AuditService(db);
    const energyCardService = new EnergyCardService(db);
    const rechargeService = new RechargeService(db);

    const authMiddleware = createAuthMiddleware({ pool: db });

    this.app.set('authService', authService);
    this.app.set('userService', userService);
    this.app.set('adminService', adminService);
    this.app.set('auditService', auditService);
    this.app.set('energyCardService', energyCardService);
    this.app.set('rechargeService', rechargeService);
    this.app.set('authMiddleware', authMiddleware);
    this.app.set('db', db);
  }

  private setupMiddleware(): void {
    const config = loadAppConfig();
    const securityMiddleware = createSecurityMiddleware({
      clientOrigin: config.clientOrigin as string,
      sessionSecret: config.sessionSecret,
      corsCredentials: true,
    });

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(cors(securityMiddleware.cors()));
    this.app.use(securityMiddleware.securityHeaders);
    this.app.use(securityMiddleware.blockHiddenFiles);

    const sessionStore = new MySQLSessionStore(getDatabaseFunction());
    this.app.use(
      session({
        store: sessionStore,
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      })
    );
  }

  private setupRoutes(): void {
    const authService = this.app.get('authService') as AuthService;
    const userService = this.app.get('userService') as UserService;
    const adminService = this.app.get('adminService') as AdminService;
    const auditService = this.app.get('auditService') as AuditService;
    const energyCardService = this.app.get('energyCardService') as EnergyCardService;
    const rechargeService = this.app.get('rechargeService') as RechargeService;
    const authMiddleware = this.app.get('authMiddleware') as ReturnType<typeof createAuthMiddleware>;

    const authRoutes = createAuthRoutes(authService, authMiddleware);
    const userRoutes = createUserRoutes(userService, authService, authMiddleware, rechargeService);
    const adminRoutes = createAdminRoutes(userService, energyCardService, adminService, authMiddleware);
    const auditRoutes = createAuditRoutes(auditService, userService, authMiddleware);
    const energyCardRoutes = createEnergyCardRoutes(energyCardService, authMiddleware);
    const rechargeRoutes = createRechargeRoutes(rechargeService, authMiddleware);

    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/user', userRoutes);
    this.app.use('/api/admin', adminRoutes);
    this.app.use('/api/audit', auditRoutes);
    this.app.use('/api/meters', energyCardRoutes);
    this.app.use('/api/recharge', rechargeRoutes);

    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  private setupErrorHandling(): void {
    const { errorHandler, notFoundHandler } = createErrorHandlerMiddleware();
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    this.app.listen(this.port, this.host, () => {
      console.log(`Server running on http://${this.host}:${this.port}`);
    });
  }

  public async stop(): Promise<void> {
    await closeDatabase();
  }
}
