import { Router } from 'express';
import { createValidationMiddleware } from '../middleware/validation';
import { createAuthMiddleware } from '../middleware/auth';
import { UserService } from '../services/userService';
import { AuthService } from '../services/authService';
import { EnergyCardService } from '../services/energyCardService';
import { RechargeService } from '../services/rechargeService';

console.log('Loading user routes');

export const createUserRoutes = (
  userService: UserService,
  authService: AuthService,
  authMiddleware: ReturnType<typeof createAuthMiddleware>,
  rechargeService: RechargeService
) => {
  const router = Router();

  router.get('/profile', authMiddleware.requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { user, profile, personalDataFilled } = await userService.getProfile(userId);
      const dbPool = (req.app.get('db') as any);
      const energyCardService = new EnergyCardService(dbPool);
      const cards = await energyCardService.getCardsByUser(userId);
      const rechargeHistory = await rechargeService.getRechargeHistory(userId);
      const kwhPrice = await rechargeService.getKwhPrice();
      res.json({
        username: user?.username || '',
        email: user?.email || '',
        profile,
        personal_data_filled: personalDataFilled,
        cards,
        recharge_history: rechargeHistory,
        kwh_price: kwhPrice
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