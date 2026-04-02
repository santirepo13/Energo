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
}