import { Pool } from 'mysql2/promise';
import { EnergyCard } from '../models/energyCardModel';

export interface IEnergyCardRepository {
  findByCardNumber: (cardNumber: string) => Promise<EnergyCard | null>;
  findByUserId: (userId: number) => Promise<EnergyCard[]>;
  findByUserIdAndCardNumber: (userId: number, cardNumber: string) => Promise<EnergyCard | null>;
  create: (userId: number, cardNumber: string, name: string | null) => Promise<number>;
  updateBalance: (userId: number, cardNumber: string, balance: number, kwh: number) => Promise<void>;
  updateName: (userId: number, cardNumber: string, name: string | null) => Promise<void>;
  release: (userId: number, cardNumber: string, releasedByUserId: number | null) => Promise<void>;
  claimReleased: (cardId: number, userId: number, name: string | null) => Promise<void>;
  transferOwnership: (cardId: number, newUserId: number) => Promise<void>;
}

export class EnergyCardRepository implements IEnergyCardRepository {
  constructor(private pool: Pool) {}

  async findByCardNumber(cardNumber: string): Promise<EnergyCard | null> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'SELECT * FROM energy_cards WHERE card_number = ? LIMIT 1',
        [cardNumber]
      );
      return Array.isArray(rows) && rows.length ? rows[0] : null;
    } finally {
      conn.release();
    }
  }

  async findByUserId(userId: number): Promise<EnergyCard[]> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'SELECT * FROM energy_cards WHERE user_id = ?',
        [userId]
      );
      return Array.isArray(rows) ? rows : [];
    } finally {
      conn.release();
    }
  }

  async findByUserIdAndCardNumber(userId: number, cardNumber: string): Promise<EnergyCard | null> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'SELECT * FROM energy_cards WHERE user_id = ? AND card_number = ?',
        [userId, cardNumber]
      );
      return Array.isArray(rows) && rows.length ? rows[0] : null;
    } finally {
      conn.release();
    }
  }

  async create(userId: number, cardNumber: string, name: string | null): Promise<number> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'INSERT INTO energy_cards (user_id, card_number, name) VALUES (?, ?, ?)',
        [userId, cardNumber, name]
      );
      return rows.insertId;
    } finally {
      conn.release();
    }
  }

  async updateBalance(userId: number, cardNumber: string, balance: number, kwh: number): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.query(
        'UPDATE energy_cards SET current_balance = ?, current_kwh = ? WHERE user_id = ? AND card_number = ?',
        [balance, kwh, userId, cardNumber]
      );
    } finally {
      conn.release();
    }
  }

  async updateName(userId: number, cardNumber: string, name: string | null): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.query(
        'UPDATE energy_cards SET name = ? WHERE user_id = ? AND card_number = ?',
        [name, userId, cardNumber]
      );
    } finally {
      conn.release();
    }
  }

  async release(userId: number, cardNumber: string, releasedByUserId: number | null): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.query(
        'UPDATE energy_cards SET user_id = NULL, released = 1, released_by_user_id = ?, released_at = CURRENT_TIMESTAMP ' +
        'WHERE user_id = ? AND card_number = ?',
        [releasedByUserId, userId, cardNumber]
      );
    } finally {
      conn.release();
    }
  }

  async claimReleased(cardId: number, userId: number, name: string | null): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.query(
        'UPDATE energy_cards SET user_id = ?, name = ?, released = 0, released_by_user_id = NULL, released_at = NULL ' +
        'WHERE id = ?',
        [userId, name, cardId]
      );
    } finally {
      conn.release();
    }
  }

  async transferOwnership(cardId: number, newUserId: number): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      await conn.query(
        'UPDATE energy_cards SET user_id = ?, released = 0, released_by_user_id = NULL, released_at = NULL ' +
        'WHERE id = ?',
        [newUserId, cardId]
      );
    } finally {
      conn.release();
    }
  }
}