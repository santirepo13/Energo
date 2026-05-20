import { Router } from 'express';
import { createAuthMiddleware } from '../middleware/auth';
import { createValidationMiddleware } from '../middleware/validation';
import { AuditService } from '../services/auditService';
import { UserService } from '../services/userService';

console.log('Cargando rutas de auditoría');

export const createAuditRoutes = (auditService: AuditService, userService: UserService, authMiddleware: ReturnType<typeof createAuthMiddleware>) => {
  const router = Router();

  // Audit-only middleware
  const requireAudit = authMiddleware.requireAudit;

  // Get audit admins (auditor only)
  router.get('/admins', requireAudit, async (req, res) => {
    try {
      const admins = await auditService.getAuditAdmins();
      res.json({ admins });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load audit admins' });
    }
  });

  // Get admin profile (auditor only)
  router.get('/admins/:id/profile', requireAudit, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await userService.getProfile(Number(id));
      res.json({ profile: result.profile });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load admin profile' });
    }
  });

  // Update admin profile (auditor only) - uses existing user profile update logic
  router.put('/admins/:id/profile', requireAudit, createValidationMiddleware().validate('profileUpdate'), async (req, res) => {
    try {
      const { id } = req.params;
      const profileData = req.body;
      await userService.updateProfile(Number(id), profileData);
      res.json({ message: 'Profile updated' });
    } catch (e: any) {
      // Handle unique constraint errors with user-friendly messages
      const errorMessage = e instanceof Error ? e.message : 'Failed to update profile';
      let userFriendlyError = errorMessage;

      if (errorMessage.includes('uniq_documento')) {
        userFriendlyError = 'El número de identificación ya está registrado para otro usuario';
      } else if (errorMessage.includes('uniq_phone')) {
        userFriendlyError = 'El teléfono ya está registrado para otro usuario';
      } else if (errorMessage.includes('duplicate')) {
        userFriendlyError = 'Ya existe un registro con estos datos';
      }

      res.status(400).json({ error: userFriendlyError });
    }
  });

  // Update admin status (auditor only)
  router.patch('/admins/:id/status', requireAudit, createValidationMiddleware().validate('statusUpdate'), async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await userService.updateStatus(Number(id), status);
      res.json({ message: 'Status updated' });
    } catch (e: any) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to update status';
      res.status(400).json({ error: errorMessage });
    }
  });

  // Get audit employees (auditor only)
  router.get('/employees', requireAudit, async (req, res) => {
    try {
      const employees = await auditService.getAuditEmployees();
      res.json({ employees });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load audit employees' });
    }
  });

  // Get employee codes (auditor only)
  router.get('/employee-codes', requireAudit, async (req, res) => {
    try {
      const codes = await auditService.getEmployeeCodes();
      res.json({ codes });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load employee codes' });
    }
  });

  // Generate employee code (auditor only)
  router.post('/employee-codes', requireAudit, async (req, res) => {
    try {
      const { role } = req.body;
      if (!role || (role !== 'admin' && role !== 'audit')) {
        res.status(400).json({ error: 'Invalid role. Must be "admin" or "audit"' });
        return;
      }
      const result = await auditService.generateEmployeeCode(role);
      res.json(result);
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to generate employee code' });
    }
  });

  // Get audit metrics series (auditor only)
  router.get('/metrics/series', requireAudit, async (req, res) => {
    try {
      const metrics = await auditService.getAuditMetricsSeries();
      res.json(metrics);
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load audit metrics series' });
    }
  });

  // Get audit metrics totals (auditor only)
  router.get('/metrics/totals', requireAudit, async (req, res) => {
    try {
      const totals = await auditService.getAuditMetricsTotals();
      res.json({ totals });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load audit metrics totals' });
    }
  });

  // Get security logs (auditor only)
  router.get('/security-logs', requireAudit, async (req, res) => {
    try {
      const logs = await auditService.getSecurityLogs();
      res.json({ logs });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load security logs' });
    }
  });

  // Get security log by ID (auditor only)
  router.get('/security-logs/:id', requireAudit, async (req, res) => {
    try {
      const { id } = req.params;
      const log = await auditService.getSecurityLogById(Number(id));
      res.json({ log });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load security log' });
    }
  });

  // Get security logs by user (auditor only)
  router.get('/security-logs/user/:userId', requireAudit, async (req, res) => {
    try {
      const { userId } = req.params;
      const logs = await auditService.getSecurityLogsByUser(Number(userId));
      res.json({ logs });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load security logs by user' });
    }
  });

  // Get kWh price history (auditor only)
  router.get('/kwh-price-history', requireAudit, async (req, res) => {
    try {
      const history = await auditService.getKwhPriceHistory();
      res.json({ history });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to load kWh price history' });
    }
  });

  return router;
};