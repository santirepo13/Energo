import { Store, SessionData } from 'express-session';
import { DatabaseFunction } from '../database/databasePool';

export class MySQLSessionStore extends Store {
  constructor(private db: DatabaseFunction) { super(); }
  
  async get(sid: string, callback: (err?: any, session?: SessionData | null) => void) {
    try {
      const [rows]: any = await this.db('SELECT sess FROM sessions WHERE sid = ?', [sid]);
      callback(null, rows.length ? rows[0].sess : null);
    } catch (e) { 
      callback(e); 
    }
  }
  
  async set(sid: string, sess: SessionData, callback?: (err?: any) => void) {
    try {
      const expires = new Date(Date.now() + 7*24*60*60*1000);
      await this.db('INSERT INTO sessions (sid, sess, expired) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE sess=?, expired=?', 
        [sid, JSON.stringify(sess), expires, JSON.stringify(sess), expires]);
      if (callback) callback(null);
    } catch (e) { 
      if (callback) callback(e); 
    }
  }
  
  async destroy(sid: string, callback?: (err?: any) => void) {
    try {
      await this.db('DELETE FROM sessions WHERE sid = ?', [sid]);
      if (callback) callback(null);
    } catch (e) { 
      if (callback) callback(e); 
    }
  }
}