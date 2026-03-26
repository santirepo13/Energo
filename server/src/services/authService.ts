import bcrypt from 'bcryptjs';
import { Pool } from 'mysql2/promise';
import { User, UserProfile, UserWithDetails } from '../models/userModel';

console.log('Loading auth service');

export class AuthService {
  constructor(private pool: Pool) {}

  async login(username: string, password: string): Promise<UserWithDetails | null> {
    const conn = await this.pool.getConnection();
    try {
      const user = await this.findUserForLogin(conn, username);
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return null;
      }
      return user;
    } finally {
      conn.release();
    }
  }

  async register(userData: any): Promise<{ userId: number; cardNumber: string | null }> {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      
      const userId = await this.createUser(conn, userData);
      const cardNumber = await this.createEnergyCard(conn, userId, userData.card_number);
      
      await conn.commit();
      return { userId, cardNumber };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      const user = await this.getUserPasswordHash(conn, userId);
      if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
        throw new Error('Contraseña actual incorrecta');
      }
      
      const pwdError = this.validatePasswordPolicy(newPassword, user.username, user.email);
      if (pwdError) {
        throw new Error(pwdError);
      }
      
      const hash = await bcrypt.hash(newPassword, 10);
      await conn.query('CALL sp_users_update_password(?, ?)', [userId, hash]);
    } finally {
      conn.release();
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

  private async findUserForLogin(conn: any, username: string): Promise<UserWithDetails | null> {
    try {
      return await callFirst(conn, 'sp_users_select_login_by_username', [username]);
    } catch (e: any) {
      if (e?.code === 'ER_CANT_AGGREGATE_2COLLATIONS' || String(e?.sqlMessage || e?.message || '').includes('Illegal mix of collations')) {
        return await this.findUserForLoginRaw(conn, username);
      }
      throw e;
    }
  }

  private async findUserForLoginRaw(conn: any, username: string): Promise<UserWithDetails | null> {
    const [rows]: any = await conn.query(
      'SELECT u.id, u.username, u.email, u.password_hash, r.name AS role_name, s.name AS status_name ' +
      'FROM users u ' +
      'LEFT JOIN roles r ON r.id = u.role_id ' +
      'LEFT JOIN statuses s ON s.id = u.status_id ' +
      'WHERE u.username = CONVERT(? USING utf8mb4) COLLATE utf8mb4_general_ci ' +
      'LIMIT 1',
      [username]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  private async createUser(conn: any, userData: any): Promise<number> {
    const password_hash = await bcrypt.hash(userData.password, 10);
    const userIns = await callAll(conn, 'sp_users_insert', [
      userData.username, 
      password_hash, 
      userData.email, 
      userData.role_id || 2, // default to 'user' role
      userData.status_id || 1 // default to 'Activo' status
    ]);
    return Number((userIns[0] || {}).inserted_id);
  }

  private async createEnergyCard(conn: any, userId: number, cardNumber: string | null): Promise<string | null> {
    if (!cardNumber) return null;
    
    try {
      const card = await this.findEnergyCard(conn, cardNumber);
      if (card) {
        if (card.user_id == null) {
          await conn.query('CALL sp_energy_cards_claim_released_by_id(?, ?, ?)', [card.id, userId, null]);
          return cardNumber;
        } else {
          throw new Error('Medidor ya enlazado, por favor contacte a soporte');
        }
      } else {
        await conn.query('CALL sp_energy_cards_insert(?, ?, ?)', [userId, cardNumber, null]);
        return cardNumber;
      }
    } catch (e: any) {
      if (e && (e.code === 'ER_DUP_ENTRY' || e.errno === 1062)) {
        throw new Error('Medidor ya enlazado, por favor contacte a soporte');
      }
      throw e;
    }
  }

  private async findEnergyCard(conn: any, cardNumber: string): Promise<any | null> {
    try {
      return await callFirst(conn, 'sp_energy_cards_find_by_card_number', [cardNumber]);
    } catch (e: any) {
      if (e?.code === 'ER_CANT_AGGREGATE_2COLLATIONS' || String(e?.sqlMessage || e?.message || '').includes('Illegal mix of collations')) {
        return await this.findEnergyCardRaw(conn, cardNumber);
      }
      throw e;
    }
  }

  private async findEnergyCardRaw(conn: any, cardNumber: string): Promise<any | null> {
    const [rows]: any = await conn.query(
      'SELECT id, user_id, card_number, name, current_balance, current_kwh, last_recharge, released, released_by_user_id, released_at ' +
      'FROM energy_cards ' +
      'WHERE card_number = CONVERT(? USING utf8mb4) COLLATE utf8mb4_general_ci ' +
      'LIMIT 1',
      [cardNumber]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  private async getUserPasswordHash(conn: any, userId: number): Promise<any> {
    const [rows]: any = await conn.query(
      'SELECT id, username, email, password_hash FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }
}

async function callFirst<T = any>(conn: any, proc: string, params: any[] = []): Promise<T | null> {
  const sql = `CALL ${proc}(${params.map(() => '?').join(',')})`;
  const [rows]: any = await conn.query(sql, params);
  const firstSet: any = Array.isArray(rows) ? rows[0] : rows;
  return Array.isArray(firstSet) && firstSet.length ? firstSet[0] : null;
}

async function callAll<T = any>(conn: any, proc: string, params: any[] = []): Promise<T[]> {
  const sql = `CALL ${proc}(${params.map(() => '?').join(',')})`;
  const [rows]: any = await conn.query(sql, params);
  const firstSet: any = Array.isArray(rows) ? rows[0] : rows;
  return Array.isArray(firstSet) ? (firstSet as T[]) : [];
}