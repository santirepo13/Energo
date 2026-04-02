import { DatabaseFunction } from '../database/databasePool';

export class LookupRepository {
  constructor(private db: DatabaseFunction) {}

  async getUserRoles(): Promise<{ id: number; name: string }[]> {
    const [rows]: any = await this.db('CALL sp_roles_get_id_by_name(?)', [null]);
    return Array.isArray(rows) ? rows : [];
  }

  async getUserStatuses(): Promise<{ id: number; name: string }[]> {
    const [rows]: any = await this.db('CALL sp_statuses_get_id_by_name(?)', [null]);
    return Array.isArray(rows) ? rows : [];
  }
}