// Validation utilities for password policy and card number validation
// Based on WebVS implementation

/**
 * Validates password against policy requirements
 * @returns Error message if invalid, null if valid
 */
export function passwordPolicyIssues(
  password: string,
  username: string,
  email: string
): string | null {
  const issues: string[] = [];

  // Min 12 characters
  if (password.length < 12) {
    issues.push('Debe tener al menos 12 caracteres');
  }

  // At least 3 of: lowercase, uppercase, digits, symbols
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  if (classes < 3) {
    issues.push('Debe incluir al menos 3 de: mayúsculas, minúsculas, dígitos, símbolos');
  }

  // No spaces
  if (/\s/.test(password)) {
    issues.push('No debe contener espacios');
  }

  // Must not contain username
  if (username && password.toLowerCase().includes(username.toLowerCase())) {
    issues.push('No debe contener el nombre de usuario');
  }

  // Must not contain local part of email
  const emailLocal = email.toLowerCase().split('@')[0] || '';
  if (emailLocal && password.toLowerCase().includes(emailLocal)) {
    issues.push('No debe contener parte del correo');
  }

  return issues.length ? `Contraseña insegura: ${issues.join('. ')}.` : null;
}

/**
 * Validates card number format (11+ digits)
 * @returns true if valid, false otherwise
 */
export function isValidCardNumber(cardNumber: string): boolean {
  // Must be 11 or more digits
  const digitsOnly = cardNumber.replace(/\D/g, '');
  return digitsOnly.length >= 11;
}

/**
 * Formats card number for display (shows last 4 digits masked)
 */
export function formatCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  return '****'.repeat(Math.ceil(digits.length / 4) - 1) + digits.slice(-4);
}

/**
 * Formats COP currency for Colombian pesos
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Formats kWh price with decimals (raw value)
 */
export function formatCOPCost(amount: number): string {
  return `${amount.toFixed(2)} COP`;
}

/**
 * Formats a date to local string
 */
export function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString('es-CO');
}

/**
 * Formats a date (date only, no time)
 */
export function formatDateOnly(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('es-CO');
}
