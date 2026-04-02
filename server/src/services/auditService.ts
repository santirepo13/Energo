import { DatabaseFunction } from '../database/databasePool';
import { SecurityRepository } from '../repositories/securityRepository';

export class AuditService {
  private securityRepository: SecurityRepository;

  constructor(private db: DatabaseFunction) {
    this.securityRepository = new SecurityRepository(db);
  }

  async getAuditAdmins(): Promise<any[]> {
    // Call the stored procedure to get audit admins
    return await this.securityRepository.getAuditAdmins();
  }

  async getAuditEmployees(): Promise<any[]> {
    // Call the stored procedure to get audit employees
    return await this.securityRepository.getAuditEmployees();
  }

  async getAuditMetricsSeries(): Promise<any[]> {
    // Call the stored procedure to get audit metrics series
    return await this.securityRepository.getAuditMetricsSeries();
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
}