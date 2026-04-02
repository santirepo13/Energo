import { Router } from 'express';
import { createValidationMiddleware } from '../middleware/validation';
import { createAuthMiddleware } from '../middleware/auth';
import { RechargeService } from '../services/rechargeService';

console.log('Cargando rutas de recarga');

export const createRechargeRoutes = (rechargeService: RechargeService, authMiddleware: ReturnType<typeof createAuthMiddleware>) => {
  const router = Router();

  router.post('/', authMiddleware.requireAuth, createValidationMiddleware().validate('recharge'), async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const { amount, kwh, card_number, pin_code } = req.body;
    const { pin, balance, kwh: newKwh } = await rechargeService.recharge(userId, amount, kwh, card_number, pin_code);
    res.json({ 
      pin_code: pin, 
      current_balance: Number(balance), 
      current_kwh: Number(newKwh) 
    });
  } catch (e) {
    res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to recharge' });
  }
});

  router.get('/history', authMiddleware.requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const history = await rechargeService.getRechargeHistory(userId);
      res.json({ history });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load history' });
    }
  });

  return router;
};