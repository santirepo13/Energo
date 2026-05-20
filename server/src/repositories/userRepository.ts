import { DatabaseFunction } from '../database/databasePool';
import { User } from '../models/userModel';

export class UserRepository {
  constructor(private db: DatabaseFunction) {}

  async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
    const [rows]: any = await this.db(
      'CALL sp_users_find_by_username_or_email(?, ?)',
      [username, email]
    );
    const resultSet = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    return Array.isArray(resultSet) && resultSet.length ? resultSet[0] : null;
  }

  async findById(id: number): Promise<User | null> {
    const [rows]: any = await this.db(
      'CALL sp_users_get_basic_by_id(?)',
      [id]
    );
    const resultSet = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    return Array.isArray(resultSet) && resultSet.length ? resultSet[0] : null;
  }

  async create(userData: any): Promise<number> {
    const [rows]: any = await this.db(
      'CALL sp_users_insert(?, ?, ?, ?, ?)',
      [userData.username, userData.password_hash, userData.email, userData.role_id, userData.status_id]
    );
    // rows structure: [[{ inserted_id: N }], OkPacket] - need rows[0][0] to get the row object
    const firstSet = Array.isArray(rows) ? rows[0] : rows;
    const insertedId = Number(firstSet && firstSet.length ? firstSet[0].inserted_id : undefined);
    if (!Number.isInteger(insertedId) || insertedId <= 0) {
      throw new Error('Failed to retrieve inserted user ID');
    }
    return insertedId;
  }

  async updateEmail(id: number, email: string): Promise<void> {
    await this.db('CALL sp_users_update_email(?, ?)', [id, email]);
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await this.db('CALL sp_users_update_password(?, ?)', [id, passwordHash]);
  }

  async updateStatus(id: number, statusId: number): Promise<void> {
    await this.db('CALL sp_users_update_status_by_name(?, ?)', [id, statusId]);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.db('CALL sp_users_update_last_login(?)', [id]);
  }

  async getUserById(userId: number): Promise<User | null> {
    const [rows]: any = await this.db(
      'CALL sp_users_info_by_id(?)',
      [userId]
    );
    const resultSet = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    return Array.isArray(resultSet) && resultSet.length ? resultSet[0] : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [rows]: any = await this.db(
      'CALL sp_users_get_by_email(?)',
      [email]
    );
    const resultSet = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    return Array.isArray(resultSet) && resultSet.length ? resultSet[0] : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [rows]: any = await this.db(
      'CALL sp_users_get_by_username(?)',
      [username]
    );
    const resultSet = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    return Array.isArray(resultSet) && resultSet.length ? resultSet[0] : null;
  }

  async getUserPasswordHash(userId: number): Promise<string | null> {
    const [rows]: any = await this.db(
      'CALL sp_users_get_password_hash(?)',
      [userId]
    );
    return Array.isArray(rows) && rows.length ? rows[0].password_hash : null;
  }

  async checkEmailExists(email: string, excludeUserId?: number): Promise<boolean> {
    const [rows]: any = await this.db(
      'CALL sp_users_email_exists_other(?, ?)',
      [email, excludeUserId || null]
    );
    return Array.isArray(rows) && rows.length ? Boolean(rows[0].exists) : false;
  }

  async checkUserExistsById(userId: number): Promise<boolean> {
    const [rows]: any = await this.db(
      'CALL sp_users_exists_by_id(?)',
      [userId]
    );
    return Array.isArray(rows) && rows.length ? Boolean(rows[0].exists) : false;
  }

  async getUserRoles(): Promise<{ id: number; name: string }[]> {
    const [rows]: any = await this.db('CALL sp_roles_get_id_by_name(?)', [null]);
    return Array.isArray(rows) ? rows : [];
  }

  async getUserStatuses(): Promise<{ id: number; name: string }[]> {
    const [rows]: any = await this.db('CALL sp_statuses_get_id_by_name(?)', [null]);
    return Array.isArray(rows) ? rows : [];
  }

  async getUserRoleStatusById(userId: number): Promise<{ role_name: string; status_name: string } | null> {
    const [rows]: any = await this.db(
      'CALL sp_users_select_role_status_by_id(?)',
      [userId]
    );
    const resultSet = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    return Array.isArray(resultSet) && resultSet.length ? resultSet[0] : null;
  }

  async getAllUsers(): Promise<User[]> {
    const [rows]: any = await this.db('CALL sp_admin_list_users()');
    // Unwrap the result set from CALL statement
    const resultSet = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    return Array.isArray(resultSet) ? resultSet : [];
  }

  async updateUserEmail(userId: number, email: string): Promise<void> {
    await this.db('CALL sp_users_update_email(?, ?)', [userId, email]);
  }

  async updateStatusByName(userId: number, statusName: string): Promise<void> {
    await this.db('CALL sp_users_update_status_by_name(?, ?)', [userId, statusName]);
  }

  async getUserLogs(userId: number): Promise<any[]> {
    // Get user's username first, then find security logs for that user
    const user = await this.getUserById(userId);
    if (!user) return [];

    const [rows]: any = await this.db(
      'CALL sp_security_logs_latest(?)',
      [200]
    );

    // Unwrap result set from CALL statement
    const resultSet = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    const allLogs = Array.isArray(resultSet) ? resultSet : [];
    return allLogs.filter((log: any) => log.username === user.username);
  }

  async generatePasswordResetToken(userId: number): Promise<string> {
    // Generate a secure random token
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 3600000);
    
    // Store the token in the database
    await this.db('CALL sp_password_reset_token_insert(?, ?)', [userId, tokenHash]);
    
    return token;
  }

  async validatePasswordResetToken(tokenHash: string): Promise<{ valid: boolean; userId?: number; username?: string }> {
    const [rows]: any = await this.db('CALL sp_password_reset_token_validate(?)', [tokenHash]);
    
    if (Array.isArray(rows) && rows.length > 0) {
      return { valid: true, userId: rows[0].user_id, username: rows[0].username };
    }
    return { valid: false };
  }

  async resetPasswordWithToken(tokenHash: string, newPasswordHash: string): Promise<boolean> {
    const [rows]: any = await this.db('CALL sp_password_reset_with_token(?, ?)', [tokenHash, newPasswordHash]);
    
    // The stored procedure returns 1 if successful, 0 if token was invalid
    return Array.isArray(rows) && rows.length > 0 && rows[0].success === 1;
  }

}