import { Pool } from 'mysql2/promise';
import { User, UserProfile, UserFlag } from '../models/userModel';

console.log('Loading user service');

export class UserService {
  constructor(private pool: Pool) {}

  async getProfile(userId: number): Promise<{ user: User; profile: UserProfile | null; personalDataFilled: boolean }> {
    const conn = await this.pool.getConnection();
    try {
      const user = await this.getUserById(conn, userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      const profile = await this.getUserProfile(conn, userId);
      const personalDataFilled = await this.getPersonalDataFilledFlag(conn, userId);
      
      return { user, profile, personalDataFilled };
    } finally {
      conn.release();
    }
  }

  async updateProfile(userId: number, profileData: any): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      
      const currentProfile = await this.getUserProfile(conn, userId);
      const docChanged = this.documentChanged(currentProfile, profileData);
      
      if (docChanged) {
        await this.handleDocumentChange(conn, userId, currentProfile, profileData);
      }
      
      await this.updateUserProfile(conn, userId, profileData);
      await this.updatePersonalDataFlag(conn, userId, profileData);
      
      await conn.commit();
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
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      if (!(await this.verifyPassword(conn, userId, currentPassword))) {
        throw new Error('Contraseña actual incorrecta');
      }
      
      const hash = await this.hashPassword(newPassword);
      await conn.query('CALL sp_users_update_password(?, ?)', [userId, hash]);
    } finally {
      conn.release();
    }
  }

  async updateStatus(userId: number, status: string): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      const statusRow = await this.getStatusIdByName(conn, status);
      if (!statusRow) {
        throw new Error('Estado no disponible');
      }
      
      await conn.query('CALL sp_users_update_status_by_name(?, ?)', [userId, status]);
    } finally {
      conn.release();
    }
  }

  private async getUserById(conn: any, userId: number): Promise<User | null> {
    const [rows]: any = await conn.query(
      'SELECT u.id, u.username, u.email, u.created_at, u.last_login, r.name AS role, s.name AS status ' +
      'FROM users u ' +
      'LEFT JOIN roles r ON u.role_id = r.id ' +
      'LEFT JOIN statuses s ON u.status_id = s.id ' +
      'WHERE u.id = ? LIMIT 1',
      [userId]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  private async getUserProfile(conn: any, userId: number): Promise<UserProfile | null> {
    const [rows]: any = await conn.query(
      'SELECT * FROM user_profiles WHERE user_id = ? LIMIT 1',
      [userId]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  private async getPersonalDataFilledFlag(conn: any, userId: number): Promise<boolean> {
    const [rows]: any = await conn.query(
      'SELECT personal_data_filled FROM user_flags WHERE user_id = ? LIMIT 1',
      [userId]
    );
    return Array.isArray(rows) && rows.length ? Boolean(rows[0].personal_data_filled) : false;
  }

  private documentChanged(currentProfile: UserProfile | null, newProfile: any): boolean {
    if (!currentProfile) return false;
    return currentProfile.tipo_identificacion !== newProfile.tipo_identificacion || 
           currentProfile.numero_identificacion !== newProfile.numero_identificacion;
  }

  private async handleDocumentChange(conn: any, userId: number, currentProfile: UserProfile | null, newProfile: any): Promise<void> {
    if (!currentProfile) return;
    
    if (currentProfile.tipo_identificacion === 'Pasaporte' && newProfile.tipo_identificacion === 'Pasaporte') {
      throw new Error('Para cambios de número de pasaporte, contacte a soporte');
    }
    
    const used = await this.hasDocumentChange(conn, userId);
    if (used) {
      throw new Error('Ya usó su cambio de documento anteriormente')
    }
  }

  private async updateUserProfile(conn: any, userId: number, profileData: any): Promise<void> {
    await conn.query(
      'UPDATE user_profiles SET ? WHERE user_id = ?',
      [profileData, userId]
    );
  }

  private async updatePersonalDataFlag(conn: any, userId: number, profileData: any): Promise<void> {
    const personalDataFilled = profileData.tipo_identificacion && profileData.numero_identificacion && profileData.primer_nombre && profileData.primer_apellido;
    const flagValue = personalDataFilled ? 1 : 0;
    
    // Validate that flagValue is a number
    if (typeof flagValue !== 'number') {
      throw new Error('Invalid value for personal_data_filled flag');
    }
    
    await conn.query(
      'INSERT INTO user_flags (user_id, personal_data_filled) VALUES (?, ?) ON DUPLICATE KEY UPDATE personal_data_filled = ?',
      [userId, flagValue, flagValue]
    );
  }

  private async getUserPasswordHash(conn: any, userId: number): Promise<User | null> {
    const [rows]: any = await conn.query(
      'SELECT id, username, email, password FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  private async verifyPassword(conn: any, userId: number, currentPassword: string): Promise<boolean> {
    const user = await this.getUserPasswordHash(conn, userId);
    if (!user) return false;
    
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(currentPassword, user.password_hash);
  }

  private async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(password, 10);
  }

  

  private async hasDocumentChange(conn: any, userId: number): Promise<boolean> {
    const [rows]: any = await conn.query(
      'SELECT document_change_used FROM user_flags WHERE user_id = ? LIMIT 1',
      [userId]
    );
    return Array.isArray(rows) && rows.length ? Boolean(rows[0].document_change_used) : false;
  }

  private async getStatusIdByName(conn: any, status: string): Promise<any> {
    const [rows]: any = await conn.query(
      'SELECT id FROM statuses WHERE name = ? LIMIT 1',
      [status]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async updateKwhPrice(adminUserId: number, price: number): Promise<{ cost_per_kwh: number }> {
    const conn = await this.pool.getConnection();
    try {
      // Call the stored procedure
      const [result]: any = await conn.query('CALL sp_set_kwh_price(?, ?)', [adminUserId, price]);
      
      // Get the updated price from settings
      const [priceRows]: any = await conn.query(
        'SELECT CAST(value AS DECIMAL(10,2)) as cost_per_kwh FROM settings WHERE `key` = ? LIMIT 1',
        ['cost_per_kwh']
      );
      
      if (!Array.isArray(priceRows) || priceRows.length === 0) {
        throw new Error('Failed to retrieve updated kWh price');
      }
      
      return { cost_per_kwh: priceRows[0].cost_per_kwh };
    } finally {
      conn.release();
    }
  }
} 