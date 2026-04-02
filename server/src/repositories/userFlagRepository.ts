import { DatabaseFunction } from '../database/databasePool';
import { UserFlag } from '../models/userFlagModel';

export class UserFlagRepository {
  constructor(private db: DatabaseFunction) {}

  async getPersonalDataFlag(userId: number): Promise<boolean> {
    const [rows]: any = await this.db(
      'CALL sp_user_flags_get_personal_data_filled(?)',
      [userId]
    );
    const resultSet = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    return Array.isArray(resultSet) && resultSet.length ? Boolean(resultSet[0].personal_data_filled) : false;
  }

  async setPersonalDataFlag(userId: number, filled: boolean): Promise<void> {
    await this.db('CALL sp_user_flags_set_personal_data_filled(?, ?)', [userId, filled ? 1 : 0]);
  }

  async createDocumentChange(userId: number, oldData: any, newData: any): Promise<void> {
    await this.db(
      'CALL sp_user_document_changes_insert(?, ?, ?, ?, ?)',
      [userId, oldData.tipo_identificacion, oldData.numero_identificacion, newData.tipo_identificacion, newData.numero_identificacion]
    );
  }
}
