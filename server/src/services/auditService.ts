import { DatabaseFunction } from '../database/databasePool';
import { SecurityRepository } from '../repositories/securityRepository';
import { EmployeeCodeRepository } from '../repositories/employeeCodeRepository';

export class AuditService {
  private securityRepository: SecurityRepository;
  private employeeCodeRepository: EmployeeCodeRepository;

  constructor(private db: DatabaseFunction) {
    this.securityRepository = new SecurityRepository(db);
    this.employeeCodeRepository = new EmployeeCodeRepository(db);
  }

  async getAuditAdmins(): Promise<any[]> {
    // Call the stored procedure to get audit admins
    return await this.securityRepository.getAuditAdmins();
  }

  async getAuditEmployees(): Promise<any[]> {
    // Call the stored procedure to get audit employees
    return await this.securityRepository.getAuditEmployees();
  }

  async getAuditMetricsSeries(): Promise<{ totals: any; by_day: any[] }> {
    const result = await this.securityRepository.getAuditMetricsSeries();
    // Transform to match frontend AuditMetrics structure
    const totalsRow = result.totals[0] || { pins: 0, total_amount: 0, total_kwh: 0 };
    return {
      totals: {
        codes_sold: totalsRow.pins || 0,
        amount_cop: totalsRow.total_amount || 0,
        kwh: totalsRow.total_kwh || 0
      },
      by_day: (result.by_day ?? [])
        .filter(row => row != null && typeof row === 'object')
        .map(row => ({
          day: row.day ? new Date(row.day).toISOString().split('T')[0] : '',
          codes_sold: row.pins || 0,
          amount_cop: row.total_amount || 0,
          kwh: row.total_kwh || 0
        }))
    };
  }

  async getAuditMetricsTotals(): Promise<any[]> {
    // Call the stored procedure to get audit metrics totals
    return await this.securityRepository.getAuditMetricsTotals();
  }

  async getSecurityLogs(): Promise<any[]> {
    // Call the stored procedure to get security logs
    return await this.securityRepository.getSecurityLogs();
  }

  async getSecurityLogById(logId: number): Promise<any | null> {
    // Call the stored procedure to get a specific security log
    return await this.securityRepository.getSecurityLogById(logId);
  }

  async getSecurityLogsByUser(userId: number): Promise<any[]> {
    // Call the stored procedure to get security logs for a specific user
    return await this.securityRepository.getSecurityLogsByUser(userId);
  }

  async getKwhPriceHistory(): Promise<any[]> {
    // Call the stored procedure to get kWh price history
    return await this.securityRepository.getKwhPriceHistory();
  }

  async getEmployeeCodes(): Promise<any[]> {
    // Get all employee codes with details
    return await this.employeeCodeRepository.listEmployeeCodes();
  }

  async generateEmployeeCode(role: 'admin' | 'audit'): Promise<{ id: number; code: string; role: string }> {
    // Generate a unique employee code in format: ADMIN-XXXXXX or AUDIT-XXXXXX
    const code = this.generateUniqueCode(role);

    // Get role ID from database
    const roleId = await this.employeeCodeRepository.getRoleIdByName(role);
    if (!roleId) {
      throw new Error(`Role '${role}' not found`);
    }

    // Insert the new employee code
    const id = await this.employeeCodeRepository.createEmployeeCode(code, roleId);

    return { id, code, role };
  }

  private generateUniqueCode(role: string): string {
    // Generate a code in format: ROLE-XXXXXXXX (role prefix + dash + 8 random characters)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 8; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${role.toUpperCase()}-${randomPart}`;
  }
}