import { DatabaseFunction } from '../database/databasePool';
import { User } from '../models/userModel';

export class UserRepository {
  constructor(private db: DatabaseFunction) {}

  async findByUsernameOrEmail(username: string, email: string): Promise<User | null> {
    const [rows]: any = await this.db(
      'CALL sp_users_find_by_username_or_email(?, ?)',
      [username, email]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async findById(id: number): Promise<User | null> {
    const [rows]: any = await this.db(
      'CALL sp_users_get_basic_by_id(?)',
      [id]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async create(userData: any): Promise<number> {
    const [rows]: any = await this.db(
      'CALL sp_users_insert(?, ?, ?, ?, ?)',
      [userData.username, userData.password_hash, userData.email, userData.role_id, userData.status_id]
    );
    return rows[0].insertId;
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
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [rows]: any = await this.db(
      'CALL sp_users_get_by_email(?)',
      [email]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [rows]: any = await this.db(
      'CALL sp_users_get_by_username(?)',
      [username]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
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
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }
}