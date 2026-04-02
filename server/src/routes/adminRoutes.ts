import { Router } from 'express';
import { createAuthMiddleware } from '../middleware/auth';
import { createValidationMiddleware } from '../middleware/validation';
import { UserService } from '../services/userService';
import { EnergyCardService } from '../services/energyCardService';
import { AdminService } from '../services/adminService';

console.log('Cargando rutas de administrador');

export const createAdminRoutes = (userService: UserService, energyCardService: EnergyCardService, adminService: AdminService, authMiddleware: ReturnType<typeof createAuthMiddleware>) => {
  const router = Router();

  // Admin-only middleware
  const requireAdmin = authMiddleware.requireAuth;
  
  // Get all users (admin only)
  router.get('/users', requireAdmin, async (req, res) => {
    try {
      const users = await adminService.getAllUsers();
      res.json({ users });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load users' });
    }
  });

  // Update user email (admin only)
  router.patch('/users/:id/email', requireAdmin, createValidationMiddleware().validate('emailUpdate'), async (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body;
      await adminService.updateUserEmail(Number(id), email);
      res.json({ message: 'Email updated' });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to update email' });
    }
  });

  // Update user status (admin only)
  router.patch('/users/:id/status', requireAdmin, createValidationMiddleware().validate('statusUpdate'), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await adminService.updateUserStatus(Number(id), status);
      res.json({ message: 'Status updated' });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to update status' });
    }
  });

  // Send password reset link (admin only)
  router.post('/users/:id/send-reset', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await adminService.sendPasswordResetLink(Number(id));
      res.json({ message: 'Reset link sent' });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to send reset link' });
    }
  });

  // Get user detail (admin only)
  router.get('/users/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const userDetail = await adminService.getUserDetail(Number(id));
      res.json({ user: userDetail });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load user detail' });
    }
  });

  // Get user logs (admin only)
  router.get('/users/:id/logs', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const logs = await adminService.getUserLogs(Number(id));
      res.json({ logs });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load user logs' });
    }
  });

  // Link meter to user (admin only)
  router.post('/users/:id/link', requireAdmin, createValidationMiddleware().validate('linkMeter'), async (req, res) => {
    try {
      const { id } = req.params;
      const { card_number } = req.body;
      await adminService.linkCardToUser(Number(id), card_number);
      res.json({ message: 'Meter linked' });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to link meter' });
    }
  });

  // Remove user meter (admin only)
  router.delete('/users/:id/:card_number', requireAdmin, async (req, res) => {
    try {
      const { id, card_number } = req.params;
      await adminService.removeUserCard(Number(id), card_number);
      res.json({ message: 'Meter removed' });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to remove meter' });
    }
  });

  // Suspend user (admin only)
  router.post('/users/:id/suspend', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await adminService.suspendUser(Number(id));
      res.json({ message: 'User suspended' });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to suspend user' });
    }
  });

  // Unsuspend user (admin only)
  router.post('/users/:id/unsuspend', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await adminService.unsuspendUser(Number(id));
      res.json({ message: 'User unsuspended' });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to unsuspend user' });
    }
  });

  // Update kWh price (admin only)
  router.post('/kwh-price', requireAdmin, createValidationMiddleware().validate('kwhPriceUpdate'), async (req, res) => {
    try {
      const { price } = req.body;
      const userId = (req.session as any).userId;
      
      // Call stored procedure to update kWh price
      const result = await userService.updateKwhPrice(userId, price);
      res.json({ message: 'KWh price updated', kwh_price: result.kwh_price });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to update kWh price' });
    }
  });

  return router;
}