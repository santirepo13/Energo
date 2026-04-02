import { Router } from 'express';
import { createAuthMiddleware } from '../middleware/auth';
import { AuditService } from '../services/auditService';

console.log('Cargando rutas de auditoría');

export const createAuditRoutes = (auditService: AuditService, authMiddleware: ReturnType<typeof createAuthMiddleware>) => {
  const router = Router();

  // Admin-only middleware
  const requireAdmin = authMiddleware.requireAuth;
  
  // Get audit admins (audithor only)
  router.get('/admins', requireAdmin, async (req, res) => {
    try {
      const admins = await auditService.getAuditAdmins();
      res.json({ admins });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load audit admins' });
    }
  });

  // Get audit employees (audithor only)
  router.get('/employees', requireAdmin, async (req, res) => {
    try {
      const employees = await auditService.getAuditEmployees();
      res.json({ employees });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load audit employees' });
    }
  });

  // Get audit metrics series (audithor only)
  router.get('/metrics/series', requireAdmin, async (req, res) => {
    try {
      const metrics = await auditService.getAuditMetricsSeries();
      res.json({ metrics });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load audit metrics series' });
    }
  });

  // Get audit metrics totals (audithor only)
  router.get('/metrics/totals', requireAdmin, async (req, res) => {
    try {
      const totals = await auditService.getAuditMetricsTotals();
      res.json({ totals });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load audit metrics totals' });
    }
  });

  // Get security logs (audithor only)
  router.get('/security-logs', requireAdmin, async (req, res) => {
    try {
      const logs = await auditService.getSecurityLogs();
      res.json({ logs });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load security logs' });
    }
  });

  // Get security log by ID (audithor only)
  router.get('/security-logs/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const log = await auditService.getSecurityLogById(Number(id));
      res.json({ log });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load security log' });
    }
  });

  // Get security logs by user (audithor only)
  router.get('/security-logs/user/:userId', requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const logs = await auditService.getSecurityLogsByUser(Number(userId));
      res.json({ logs });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load security logs by user' });
    }
  });

  return router;
};