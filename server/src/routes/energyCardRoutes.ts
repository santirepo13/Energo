import { Router } from 'express';
import { createValidationMiddleware } from '../middleware/validation';
import { createAuthMiddleware } from '../middleware/auth';
import { EnergyCardService } from '../services/energyCardService';

export const createEnergyCardRoutes = (energyCardService: EnergyCardService, authMiddleware: ReturnType<typeof createAuthMiddleware>) => {
  const router = Router();

  router.get('/', authMiddleware.requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const cards = await energyCardService.getCardsByUser(userId);
      res.json({ meters: cards });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load meters' });
    }
  });

  router.post('/', authMiddleware.requireAuth, createValidationMiddleware().validate('meterLink'), async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { card_number, name } = req.body;
      const card = await energyCardService.addCard(userId, card_number, name);
      res.json({ meter: card });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to add meter' });
    }
  });

  router.delete('/:card_number', authMiddleware.requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const cardNumber = req.params.card_number;
      await energyCardService.releaseCard(userId, cardNumber);
      res.json({ message: 'Meter released' });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to release meter' });
    }
  });

  router.patch('/:card_number', authMiddleware.requireAuth, createValidationMiddleware().validate('meterUpdate'), async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const cardNumber = req.params.card_number;
      const { name } = req.body;
      const card = await energyCardService.updateCardName(userId, cardNumber, name);
      res.json({ meter: card });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to update meter name' });
    }
  });

  return router;
};