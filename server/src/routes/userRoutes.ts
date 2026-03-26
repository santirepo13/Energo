import { Router } from 'express';
import { createValidationMiddleware } from '../middleware/validation';
import { createAuthMiddleware } from '../middleware/auth';
import { UserService } from '../services/userService';

console.log('Loading user routes');

export const createUserRoutes = (userService: UserService, authMiddleware: ReturnType<typeof createAuthMiddleware>) => {
  const router = Router();

  router.get('/profile', authMiddleware.requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { user, profile, personalDataFilled } = await userService.getProfile(userId);
      res.json({ user, profile, personalDataFilled });
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
      await userService.changePassword(userId, req.body.current_password, req.body.new_password);
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