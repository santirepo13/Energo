import bcrypt from 'bcryptjs';
import { DatabaseFunction } from '../database/databasePool';
import { User } from '../models/userModel';
import { UserProfile } from '../models/userProfileModel';
import { UserFlag } from '../models/userFlagModel';
import { UserWithDetails } from '../types/interfaces';
import { UserRepository } from '../repositories/userRepository';
import { UserProfileRepository } from '../repositories/userProfileRepository';
import { EmployeeCodeRepository } from '../repositories/employeeCodeRepository';
import { LookupRepository } from '../repositories/lookupRepository';

console.log('Cargando servicio de autenticación');

export class AuthService {
  private userRepository: UserRepository;
  private userProfileRepository: UserProfileRepository;
  private employeeCodeRepository: EmployeeCodeRepository;
  private lookupRepository: LookupRepository;

  constructor(private db: DatabaseFunction) {
    this.userRepository = new UserRepository(db);
    this.userProfileRepository = new UserProfileRepository(db);
    this.employeeCodeRepository = new EmployeeCodeRepository(db);
    this.lookupRepository = new LookupRepository(db);
  }

  async login(username: string, password: string): Promise<UserWithDetails | null> {
    // For compatibility with existing code that uses getConnection(), we'll use the database function directly
    // but we need to handle the connection properly
    try {
      const user = await this.findUserForLogin(this.db, username);
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return null;
      }
      return user;
    } catch (error) {
      return null;
    }
  }

  async register(userData: any): Promise<{ userId: number; cardNumber: string | null }> {
    try {
      let roleId = userData.role_id || 3; // Default to normal user (role_id=3)
      let employeeCodeId: number | null = null;

      // If employee code is provided, validate it and get the associated role
      if (userData.employee_code) {
        const code = String(userData.employee_code).trim();
        if (!code) {
          throw new Error('El código de empleado es obligatorio');
        }

        // Look up the employee code (locks row for update)
        const employeeCode = await this.employeeCodeRepository.getEmployeeCode(code);
        
        if (!employeeCode) {
          throw new Error('Código de empleado no válido');
        }

        if (employeeCode.used) {
          throw new Error('Código de empleado ya ha sido utilizado');
        }

        // Use the role_id from the employee code
        roleId = employeeCode.role_id;
        employeeCodeId = employeeCode.id;
      }

      // Create user with the determined role_id
      const userId = await this.createUserDirect({ ...userData, role_id: roleId });

      // Create energy card (only if not registering with employee code)
      let cardNumber: string | null = null;
      if (!userData.employee_code && userData.card_number) {
        cardNumber = await this.createEnergyCardDirect(userId, userData.card_number);
      }

      // Mark employee code as used if one was provided
      if (employeeCodeId !== null) {
        const usageId = await this.employeeCodeRepository.createEmployeeCodeUsage(employeeCodeId, userId);
        await this.employeeCodeRepository.markEmployeeCodeUsed(employeeCodeId, usageId);
      }

      return { userId, cardNumber };
    } catch (error) {
      throw error;
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.getUserPasswordHashDirect(userId);
      if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
        throw new Error('Contraseña actual incorrecta');
      }
      
      const pwdError = this.validatePasswordPolicy(newPassword, user.username, user.email);
      if (pwdError) {
        throw new Error(pwdError);
      }
      
      const hash = await bcrypt.hash(newPassword, 10);
      await this.db('CALL sp_users_update_password(?, ?)', [userId, hash]);
    } catch (error) {
      throw error;
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

  private async findUserForLogin(db: DatabaseFunction, username: string): Promise<UserWithDetails | null> {
    try {
      return await callFirst(db, 'sp_users_select_login_by_username', [username]);
    } catch (e: any) {
      if (e?.code === 'ER_CANT_AGGREGATE_2COLLATIONS' || String(e?.sqlMessage || e?.message || '').includes('Illegal mix of collations')) {
        return await this.findUserForLoginRaw(db, username);
      }
      throw e;
    }
  }

  private async findUserForLoginRaw(db: DatabaseFunction, username: string): Promise<UserWithDetails | null> {
    const [rows]: any = await db(
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

  private async getUserPasswordHashDirect(userId: number): Promise<any> {
    const [rows]: any = await this.db(
      'SELECT id, username, email, password_hash FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  private async createUserDirect(userData: any): Promise<number> {
    const password_hash = await bcrypt.hash(userData.password, 10);
    const [rows]: any = await this.db(
      'CALL sp_users_insert(?, ?, ?, ?, ?)',
      [userData.username, password_hash, userData.email, userData.role_id || 3, userData.status_id || 1]
    );
    // rows structure: [[{ inserted_id: N }], OkPacket] - need rows[0][0] to get the row object
    const firstSet = Array.isArray(rows) ? rows[0] : rows;
    const insertedId = Number(firstSet && firstSet.length ? firstSet[0].inserted_id : undefined);
    if (!Number.isInteger(insertedId) || insertedId <= 0) {
      throw new Error('Failed to retrieve inserted user ID');
    }
    return insertedId;
  }

  private async createEnergyCardDirect(userId: number, cardNumber: string | null): Promise<string | null> {
    // Sanitize cardNumber: reject NaN, non-string types, and empty/whitespace-only strings
    if (!cardNumber || typeof cardNumber !== 'string' || cardNumber.trim() === '') {
      return null;
    }
    
    const sanitizedCardNumber = cardNumber.trim();
    
    try {
      const card = await this.findEnergyCardDirect(sanitizedCardNumber);
      if (card) {
        if (card.user_id == null) {
          await this.db('CALL sp_energy_cards_claim_released_by_id(?, ?, ?)', [card.id, userId, null]);
          return sanitizedCardNumber;
        } else {
          throw new Error('Medidor ya enlazado, por favor contacte a soporte');
        }
      } else {
        await this.db('CALL sp_energy_cards_insert(?, ?, ?)', [userId, sanitizedCardNumber, null]);
        return sanitizedCardNumber;
      }
    } catch (e: any) {
      if (e && (e.code === 'ER_DUP_ENTRY' || e.errno === 1062)) {
        throw new Error('Medidor ya enlazado, por favor contacte a soporte');
      }
      throw e;
    }
  }

  private async findEnergyCardDirect(cardNumber: string): Promise<any | null> {
    try {
      const [rows]: any = await this.db(
        'CALL sp_energy_cards_find_by_card_number(?)',
        [cardNumber]
      );
      return Array.isArray(rows) && rows.length ? rows[0] : null;
    } catch (e: any) {
      if (e?.code === 'ER_CANT_AGGREGATE_2COLLATIONS' || String(e?.sqlMessage || e?.message || '').includes('Illegal mix of collations')) {
        return await this.findEnergyCardRawDirect(cardNumber);
      }
      throw e;
    }
  }

  private async findEnergyCardRawDirect(cardNumber: string): Promise<any | null> {
    const [rows]: any = await this.db(
      'SELECT id, user_id, card_number, name, current_balance, current_kwh, last_recharge, released, released_by_user_id, released_at ' +
      'FROM energy_cards ' +
      'WHERE card_number = CONVERT(? USING utf8mb4) COLLATE utf8mb4_general_ci ' +
      'LIMIT 1',
      [cardNumber]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async validatePasswordResetToken(tokenHash: string): Promise<{ valid: boolean; userId?: number; username?: string }> {
    return await this.userRepository.validatePasswordResetToken(tokenHash);
  }

  async resetPasswordWithToken(tokenHash: string, newPasswordHash: string): Promise<boolean> {
    return await this.userRepository.resetPasswordWithToken(tokenHash, newPasswordHash);
  }
}

async function callFirst<T = any>(db: DatabaseFunction, proc: string, params: any[] = []): Promise<T | null> {
  const sql = `CALL ${proc}(${params.map(() => '?').join(',')})`;
  const [rows]: any = await db(sql, params);
  const firstSet: any = Array.isArray(rows) ? rows[0] : rows;
  return Array.isArray(firstSet) && firstSet.length ? firstSet[0] : null;
}

async function callAll<T = any>(db: DatabaseFunction, proc: string, params: any[] = []): Promise<T[]> {
  const sql = `CALL ${proc}(${params.map(() => '?').join(',')})`;
  const [rows]: any = await db(sql, params);
  const firstSet: any = Array.isArray(rows) ? rows[0] : rows;
  return Array.isArray(firstSet) ? (firstSet as T[]) : [];
}