import { Pool } from 'mysql2/promise';
import { User, UserProfile, UserFlag, EmployeeCode, EmployeeCodeUsage } from '../models/userModel';

export class UserRepository {
  constructor(private pool: Pool) {}

  async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'SELECT u.id, u.username, u.email, u.password_hash, r.name AS role_name, s.name AS status_name ' +
        'FROM users u ' +
        'LEFT JOIN roles r ON r.id = u.role_id ' +
        'LEFT JOIN statuses s ON s.id = u.status_id ' +
        'WHERE u.username = ? OR u.email = ? ' +
        'LIMIT 1',
        [username, email]
      );
      return Array.isArray(rows) && rows.length ? rows[0] : null;
    } finally {
      conn.release();
    }
  }

  async findById(id: number): Promise<User | null> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'SELECT u.id, u.username, u.email, u.password_hash, r.name AS role_name, s.name AS status_name ' +
        'FROM users u ' +
        'LEFT JOIN roles r ON r.id = u.role_id ' +
        'LEFT JOIN statuses s ON s.id = u.status_id ' +
        'WHERE u.id = ? LIMIT 1',
        [id]
      );
      return Array.isArray(rows) && rows.length ? rows[0] : null;
    } finally {
      conn.release();
    }
  }

  async create(userData: any): Promise<number> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'INSERT INTO users (username, password_hash, email, role_id, status_id) VALUES (?, ?, ?, ?, ?)',
        [userData.username, userData.password_hash, userData.email, userData.role_id, userData.status_id]
      );
      return rows.insertId;
    } finally {
      conn.release();
    }
  }

  async updateEmail(id: number, email: string): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.query('UPDATE users SET email = ? WHERE id = ?', [email, id]);
    } finally {
      conn.release();
    }
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
    } finally {
      conn.release();
    }
  }

  async updateStatus(id: number, statusId: number): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.query('UPDATE users SET status_id = ? WHERE id = ?', [statusId, id]);
    } finally {
      conn.release();
    }
  }

  async updateLastLogin(id: number): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    } finally {
      conn.release();
    }
  }

  async getProfile(userId: number): Promise<UserProfile | null> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'SELECT * FROM user_profiles WHERE user_id = ? LIMIT 1',
        [userId]
      );
      return Array.isArray(rows) && rows.length ? rows[0] : null;
    } finally {
      conn.release();
    }
  }

  async createProfile(profileData: any): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.query(
        'INSERT INTO user_profiles (user_id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, tipo_identificacion, numero_identificacion, direccion, telefono) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          profileData.user_id,
          profileData.primer_nombre,
          profileData.segundo_nombre,
          profileData.primer_apellido,
          profileData.segundo_apellido,
          profileData.tipo_identificacion,
          profileData.numero_identificacion,
          profileData.direccion,
          profileData.telefono
        ]
      );
    } finally {
      conn.release();
    }
  }

  async updateProfile(userId: number, profileData: any): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.query(
        'INSERT INTO user_profiles (user_id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, tipo_identificacion, numero_identificacion, direccion, telefono) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE ' +
        'primer_nombre = VALUES(primer_nombre), ' +
        'segundo_nombre = VALUES(segundo_nombre), ' +
        'primer_apellido = VALUES(primer_apellido), ' +
        'segundo_apellido = VALUES(segundo_apellido), ' +
        'tipo_identificacion = VALUES(tipo_identificacion), ' +
        'numero_identificacion = VALUES(numero_identificacion), ' +
        'direccion = VALUES(direccion), ' +
        'telefono = VALUES(telefono)',
        [
          userId,
          profileData.primer_nombre,
          profileData.segundo_nombre,
          profileData.primer_apellido,
          profileData.segundo_apellido,
          profileData.tipo_identificacion,
          profileData.numero_identificacion,
          profileData.direccion,
          profileData.telefono
        ]
      );
    } finally {
      conn.release();
    }
  }

  async getEmployeeCode(code: string): Promise<EmployeeCode | null> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'SELECT * FROM employee_codes WHERE code = ? LIMIT 1',
        [code]
      );
      return Array.isArray(rows) && rows.length ? rows[0] : null;
    } finally {
      conn.release();
    }
  }

  async lockEmployeeCode(code: string): Promise<EmployeeCode | null> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'SELECT * FROM employee_codes WHERE code = ? FOR UPDATE',
        [code]
      );
      return Array.isArray(rows) && rows.length ? rows[0] : null;
    } finally {
      conn.release();
    }
  }

  async markEmployeeCodeUsed(codeId: number, usageId: number): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.query('CALL sp_employee_codes_mark_used(?, ?)', [codeId, usageId]);
    } finally {
      conn.release();
    }
  }

  async createEmployeeCodeUsage(codeId: number, userId: number): Promise<number> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'INSERT INTO employee_code_usages (employee_code_id, user_id) VALUES (?, ?)',
        [codeId, userId]
      );
      return rows.insertId;
    } finally {
      conn.release();
    }
  }

  async getPersonalDataFlag(userId: number): Promise<boolean> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'SELECT personal_data_filled FROM user_flags WHERE user_id = ? LIMIT 1',
        [userId]
      );
      return Array.isArray(rows) && rows.length ? Boolean(rows[0].personal_data_filled) : false;
    } finally {
      conn.release();
    }
  }

  async setPersonalDataFlag(userId: number, filled: boolean): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.query(
        'INSERT INTO user_flags (user_id, personal_data_filled, filled_at) VALUES (?, ?, CURRENT_TIMESTAMP) ' +
        'ON DUPLICATE KEY UPDATE personal_data_filled = ?, filled_at = IF(filled_at IS NULL, VALUES(filled_at), filled_at)',
        [userId, filled ? 1 : 0, filled ? 1 : 0]
      );
    } finally {
      conn.release();
    }
  }

  async createDocumentChange(userId: number, oldData: any, newData: any): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.query(
        'INSERT INTO user_document_changes (user_id, old_tipo, old_numero, new_tipo, new_numero) VALUES (?, ?, ?, ?, ?)',
        [userId, oldData.tipo_identificacion, oldData.numero_identificacion, newData.tipo_identificacion, newData.numero_identificacion]
      );
    } finally {
      conn.release();
    }
  }
}