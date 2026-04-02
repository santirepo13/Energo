import { DatabaseFunction } from '../database/databasePool';
import { EmployeeCode, EmployeeCodeUsage } from '../models/employeeCodeModel';

export class EmployeeCodeRepository {
  constructor(private db: DatabaseFunction) {}

  async getEmployeeCode(code: string): Promise<EmployeeCode | null> {
    const [rows]: any = await this.db(
      'CALL sp_employee_codes_get_for_update(?)',
      [code]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async lockEmployeeCode(code: string): Promise<EmployeeCode | null> {
    const [rows]: any = await this.db(
      'CALL sp_employee_codes_get_for_update(?)',
      [code]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async markEmployeeCodeUsed(codeId: number, usageId: number): Promise<void> {
    await this.db('CALL sp_employee_codes_mark_used(?, ?)', [codeId, usageId]);
  }

  async createEmployeeCodeUsage(codeId: number, userId: number): Promise<number> {
    const [rows]: any = await this.db(
      'CALL sp_employee_code_usages_insert(?, ?)',
      [codeId, userId]
    );
    return rows[0].insertId;
  }
}