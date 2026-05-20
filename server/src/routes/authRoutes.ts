import { Router } from 'express';
import { createValidationMiddleware } from '../middleware/validation';
import { createAuthMiddleware } from '../middleware/auth';
import { AuthService } from '../services/authService';
import { logSecurityEvent, getClientIP } from '../config/security';
import { getDatabaseFunction } from '../database/databasePool';

console.log('Cargando rutas de autenticación');

export const createAuthRoutes = (authService: AuthService, authMiddleware: ReturnType<typeof createAuthMiddleware>) => {
  const router = Router();

  router.post('/login', createValidationMiddleware().validate('login'), async (req, res) => {
    const { username, password } = req.body;
    const ip = getClientIP(req);
    const db = getDatabaseFunction();
    
    const user = await authService.login(username, password);
    if (!user) {
      await logSecurityEvent(db, 'LOGIN_FAILED', username, ip, 'Invalid credentials');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    await logSecurityEvent(db, 'LOGIN_SUCCESS', username, ip, `User ID: ${user.id}, Role: ${user.role_name}`);
    
    (req.session as any).userId = user.id;
    (req.session as any).username = user.username;
    (req.session as any).role = user.role_name;
    (req.session as any).status = user.status_name;
    
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.status(500).json({ error: 'Session error' });
      }
      
      // Force Set-Cookie header to be properly flushed before response ends
      res.on('finish', () => {
        setTimeout(() => {}, 2);
      });
      
      res.json({ message: 'Login successful' });
    });
  });

  router.post('/register', createValidationMiddleware().validate('register'), async (req, res) => {
    try {
      const { userId, cardNumber } = await authService.register(req.body);
      res.json({ message: 'Registration successful', userId, cardNumber });
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Registration failed' });
    }
  });

  router.post('/logout', authMiddleware.requireAuth, async (req, res) => {
    const username = (req.session as any)?.username as string;
    const ip = getClientIP(req);
    const db = getDatabaseFunction();
    const userId = (req.session as any)?.userId;
    
    await logSecurityEvent(db, 'LOGOUT', username || null, ip, `User ID: ${userId}`);
    
    (req.session as any).destroy(() => {
      res.json({ message: 'Logged out' });
    });
  });

  // Validate password reset token
  router.get('/password/reset/validate', async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Token required' });
      }
      
      const crypto = await import('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      const validation = await authService.validatePasswordResetToken(tokenHash);
      
      if (validation.valid) {
        res.json({ username: validation.username, valid: true });
      } else {
        res.status(400).json({ error: 'Invalid or expired token' });
      }
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid token' });
    }
  });

  router.post('/password/reset', createValidationMiddleware().validate('passwordReset'), async (req, res) => {
    try {
      const { token, new_password } = req.body;
      
      const crypto = await import('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.hash(new_password, 10);
      
      const success = await authService.resetPasswordWithToken(tokenHash, passwordHash);
      
      if (success) {
        res.json({ message: 'Password reset successful' });
      } else {
        res.status(400).json({ error: 'Invalid or expired token' });
      }
    } catch (e) {
      res.status(400).json({ error: e instanceof Error ? e.message : 'Password reset failed' });
    }
  });

  return router;
};