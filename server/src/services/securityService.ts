import { Pool } from 'mysql2/promise';

export interface SecurityService {
  logEvent: (eventType: string, username: string | null, ip: string, details: any) => Promise<void>;
  validatePasswordPolicy: (password: string, username: string, email: string) => string | null;
}

export class SecurityService implements SecurityService {
  constructor(private pool: Pool) {}

  async logEvent(eventType: string, username: string | null, ip: string, details: any): Promise<void> {
    try {
      const conn = await this.pool.getConnection();
      try {
        const payload = typeof details === 'string' ? details : JSON.stringify(details);
        await conn.query('CALL sp_security_logs_insert(?, ?, ?, ?)', [eventType, username, ip, payload]);
      } finally {
        conn.release();
      }
    } catch (e) {
      console.error('Failed to log security event', e);
    }
  }

  validatePasswordPolicy(password: string, username: string, email: string): string | null {
    const issues: string[] = [];
    const pw = String(password ?? '');
    const uname = String(username ?? '').toLowerCase();
    const emailLocal = String(email ?? '').toLowerCase().split('@')[0] || '';

    if (pw.length < 12) {
      issues.push('Debe tener al menos 12 caracteres');
    }
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasDigit = /[0-9]/.test(pw);
    const hasSymbol = /[^A-Za-z0-9]/.test(pw);
    const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
    if (classes < 3) {
      issues.push('Debe incluir al menos 3 de: mayúsculas, minúsculas, dígitos, símbolos');
    }
    if (/\s/.test(pw)) {
      issues.push('No debe contener espacios');
    }
    const lowerPw = pw.toLowerCase();
    if (uname && lowerPw.includes(uname)) {
      issues.push('No debe contener el nombre de usuario');
    }
    if (emailLocal && lowerPw.includes(emailLocal)) {
      issues.push('No debe contener parte del correo');
    }
    if (issues.length) {
      return `Contraseña insegura: ${issues.join('. ')}.`;
    }
    return null;
  }
}