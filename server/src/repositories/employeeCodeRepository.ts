import { DatabaseFunction } from '../database/databasePool';
import { EmployeeCode, EmployeeCodeUsage } from '../models/employeeCodeModel';
import {EmployeeCodeWithDetails} from '../types/interfaces'

export class EmployeeCodeRepository {
  constructor(private db: DatabaseFunction) {}

  async getEmployeeCode(code: string): Promise<EmployeeCode | null> {
    const [rows]: any = await this.db(
      'CALL sp_employee_codes_get_for_update(?)',
      [code]
    );
    const resultSet = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    return Array.isArray(resultSet) && resultSet.length ? resultSet[0] : null;
  }

  async lockEmployeeCode(code: string): Promise<EmployeeCode | null> {
    const [rows]: any = await this.db(
      'CALL sp_employee_codes_get_for_update(?)',
      [code]
    );
    const resultSet = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    return Array.isArray(resultSet) && resultSet.length ? resultSet[0] : null;
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

  async listEmployeeCodes(): Promise<EmployeeCodeWithDetails[]> {
    const [rows]: any = await this.db('CALL sp_employee_codes_list()');
    const resultSet = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    return Array.isArray(resultSet) ? resultSet : [];
  }

  async createEmployeeCode(code: string, roleId: number): Promise<number> {
    const [rows]: any = await this.db(
      'CALL sp_employee_codes_insert(?, ?)',
      [code, roleId]
    );
    return rows[0].insertId;
  }

  async getRoleIdByName(roleName: string): Promise<number | null> {
    const [rows]: any = await this.db(
      'CALL sp_roles_get_id_by_name(?)',
      [roleName]
    );
    // MySQL stored procedures return result sets wrapped in an array
    // rows[0] is the actual result set array, rows[0][0] is the first row
    const resultSet = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    return Array.isArray(resultSet) && resultSet.length ? resultSet[0].id : null;
  }
}