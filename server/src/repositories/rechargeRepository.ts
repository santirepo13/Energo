import { Pool } from 'mysql2/promise';
import { RechargePin, RechargeTransaction } from '../models/rechargeModel';

export interface RechargeRepository {
  createPin: (userId: number, cardNumber: string, pinCode: string, amount: number, kwh: number) => Promise<number>;
  createTransaction: (userId: number, cardNumber: string, amount: number, kwh: number) => Promise<number>;
  findByUserId: (userId: number) => Promise<RechargeTransaction[]>;
  findByUserIdAndCardNumber: (userId: number, cardNumber: string) => Promise<RechargeTransaction[]>;
  getLatestPins: (limit: number) => Promise<RechargePin[]>;
}

export class RechargeRepository implements RechargeRepository {
  constructor(private pool: Pool) {}

  async createPin(userId: number, cardNumber: string, pinCode: string, amount: number, kwh: number): Promise<number> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'INSERT INTO recharge_pins (user_id, card_number, pin_code, amount, kwh) VALUES (?, ?, ?, ?, ?)',
        [userId, cardNumber, pinCode, amount, kwh]
      );
      return rows.insertId;
    } finally {
      conn.release();
    }
  }

  async createTransaction(userId: number, cardNumber: string, amount: number, kwh: number): Promise<number> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'INSERT INTO recharge_transactions (user_id, card_number, amount, kwh) VALUES (?, ?, ?, ?)',
        [userId, cardNumber, amount, kwh]
      );
      return rows.insertId;
    } finally {
      conn.release();
    }
  }

  async findByUserId(userId: number): Promise<RechargeTransaction[]> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'SELECT * FROM recharge_pins WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return Array.isArray(rows) ? rows : [];
    } finally {
      conn.release();
    }
  }

  async findByUserIdAndCardNumber(userId: number, cardNumber: string): Promise<RechargeTransaction[]> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'SELECT * FROM recharge_pins WHERE user_id = ? AND card_number = ? ORDER BY created_at DESC',
        [userId, cardNumber]
      );
      return Array.isArray(rows) ? rows : [];
    } finally {
      conn.release();
    }
  }

  async getLatestPins(limit: number): Promise<RechargePin[]> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'SELECT * FROM recharge_pins ORDER BY created_at DESC LIMIT ?',
        [limit]
      );
      return Array.isArray(rows) ? rows : [];
    } finally {
      conn.release();
    }
  }
}