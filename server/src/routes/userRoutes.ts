import { Router } from 'express';
import { createValidationMiddleware } from '../middleware/validation';
import { createAuthMiddleware } from '../middleware/auth';
import { UserService } from '../services/userService';
import { AuthService } from '../services/authService';
import { EnergyCardService } from '../services/energyCardService';
import { RechargeService } from '../services/rechargeService';
import { AuditService } from '../services/auditService';
import { UserRepository } from '../repositories/userRepository';

console.log('Loading user routes');

export const createUserRoutes = (
  userService: UserService,
  authService: AuthService,
  authMiddleware: ReturnType<typeof createAuthMiddleware>,
  rechargeService: RechargeService,
  auditService?: AuditService
) => {
  const router = Router();

  router.get('/profile', authMiddleware.requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { user, profile, personalDataFilled } = await userService.getProfile(userId);
      const dbPool = (req.app.get('db') as any);
      const energyCardService = new EnergyCardService(dbPool);
      const userRepository = new UserRepository(dbPool);
      const cards = await energyCardService.getCardsByUser(userId);
      const roleStatus = await userRepository.getUserRoleStatusById(userId);

      // Admin users get all recharge history, regular users get only their own
      const isAdmin = roleStatus?.role_name === 'admin' || roleStatus?.role_name === 'administrator';
      const rechargeHistory = isAdmin
        ? await rechargeService.getAllRechargeHistory()
        : await rechargeService.getRechargeHistory(userId);

      const kwhPrice = await rechargeService.getKwhPrice();

      // Include security logs for audit users
      let securityLogs: any[] = [];
      const isAudit = roleStatus?.role_name === 'audit' || roleStatus?.role_name === 'auditor';
      if (isAudit && auditService) {
        securityLogs = await auditService.getSecurityLogs();
      }

      res.json({
        user: {
          username: user?.username || '',
          role: roleStatus?.role_name ?? null,
          status: roleStatus?.status_name ?? null,
        },
        username: user?.username || '',
        email: user?.email || '',
        profile,
        personal_data_filled: personalDataFilled,
        cards,
        recharge_history: rechargeHistory,
        kwh_price: kwhPrice,
        security_logs: securityLogs
      });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load profile' });
    }
  });

  router.put('/profile', authMiddleware.requireAuth, createValidationMiddleware().validate('profileUpdate'), async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      await userService.updateProfile(userId, req.body);
      res.json({ message: 'Profile updated' });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to update profile' });
    }
  });

  router.post('/password-change', authMiddleware.requireAuth, createValidationMiddleware().validate('passwordChange'), async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      await authService.changePassword(userId, req.body.current_password, req.body.new_password);
      res.json({ message: 'Password updated' });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to change password' });
    }
  });

  router.post('/status', authMiddleware.requireAuth, createValidationMiddleware().validate('statusUpdate'), async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      await userService.updateStatus(userId, req.body);
      res.json({ message: `Account ${req.body === 'Pausa' ? 'paused' : 'disabled'}` });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to update status' });
    }
  });

  return router;
};
