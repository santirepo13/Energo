import bcrypt from 'bcryptjs';

console.log('Cargando utilidad de contraseña');

export class PasswordUtils {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
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
      issues.push('Debe incluir al menos 3: mayúsculas, minúsculas, dígitos, símbolos');
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