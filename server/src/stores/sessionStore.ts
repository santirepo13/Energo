import { Store, SessionData } from 'express-session';
import { Pool } from 'mysql2/promise';

export class MySQLSessionStore extends Store {
  constructor(private pool: Pool) { super(); }
  
  async get(sid: string, callback: (err?: any, session?: SessionData | null) => void) {
    try {
      const conn = await this.pool.getConnection();
      const [rows]: any = await conn.query('SELECT sess FROM sessions WHERE sid = ?', [sid]);
      conn.release();
      callback(null, rows.length ? rows[0].sess : null);
    } catch (e) { 
      callback(e); 
    }
  }
  
  async set(sid: string, sess: SessionData, callback?: (err?: any) => void) {
    try {
      const conn = await this.pool.getConnection();
      const expires = new Date(Date.now() + 7*24*60*60*1000);
      await conn.query('INSERT INTO sessions (sid, sess, expired) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE sess=?, expired=?', 
        [sid, JSON.stringify(sess), expires, JSON.stringify(sess), expires]);
      conn.release();
      if (callback) callback(null);
    } catch (e) { 
      if (callback) callback(e); 
    }
  }
  
  async destroy(sid: string, callback?: (err?: any) => void) {
    try {
      const conn = await this.pool.getConnection();
      await conn.query('DELETE FROM sessions WHERE sid = ?', [sid]);
      conn.release();
      if (callback) callback(null);
    } catch (e) { 
      if (callback) callback(e); 
    }
  }
}