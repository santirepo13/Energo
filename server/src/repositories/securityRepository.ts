import { DatabaseFunction } from '../database/databasePool';

export class SecurityRepository {
  constructor(private db: DatabaseFunction) {}

  async logEvent(eventType: string, username: string | null, ip: string, details: any): Promise<void> {
    try {
      await this.db('CALL sp_security_logs_insert(?, ?, ?, ?)', [eventType, username, ip, typeof details === 'string' ? details : JSON.stringify(details)]);
    } catch (e) {
      console.error('Failed to log security event', e);
    }
  }

  async getAuditAdmins(): Promise<any[]> {
    const [rows]: any = await this.db('CALL sp_audit_list_admins()');
    return Array.isArray(rows) ? rows : [];
  }

  async getAuditEmployees(): Promise<any[]> {
    const [rows]: any = await this.db('CALL sp_audit_list_employees()');
    return Array.isArray(rows) ? rows : [];
  }

  async getAuditMetricsSeries(): Promise<{ totals: any[]; by_day: any[] }> {
    const [result]: any = await this.db('CALL sp_audit_metrics_series(?)', [30]);
    // Stored procedure returns two result sets: totals and by_day
    const totals = Array.isArray(result[0]) ? result[0] : [];
    const by_day = Array.isArray(result[1]) ? result[1] : [];
    return { totals, by_day };
  }

  async getAuditMetricsTotals(): Promise<any[]> {
    const [rows]: any = await this.db('CALL sp_audit_metrics_totals()');
    return Array.isArray(rows) ? rows : [];
  }

  async getSecurityLogs(): Promise<any[]> {
    const [rows]: any = await this.db('CALL sp_security_logs_latest(?)', [200]);
    return Array.isArray(rows) ? rows : [];
  }

  async getSecurityLogById(logId: number): Promise<any | null> {
    const [rows]: any = await this.db('CALL sp_security_logs_get_by_id(?)', [logId]);
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async getSecurityLogsByUser(userId: number): Promise<any[]> {
    const [rows]: any = await this.db('CALL sp_security_logs_by_user(?)', [userId]);
    return Array.isArray(rows) ? rows : [];
  }

  async getKwhPriceHistory(): Promise<any[]> {
    const [rows]: any = await this.db('CALL sp_kwh_price_history_list()');
    return Array.isArray(rows) ? rows : [];
  }
}