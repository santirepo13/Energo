import { Pool } from 'mysql2/promise';
import { EnergyCard } from '../models/energyCardModel';

console.log('Loading energy card service');

export class EnergyCardService {
  constructor(private pool: Pool) {}

  async getCardsByUser(userId: number): Promise<EnergyCard[]> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'CALL sp_energy_cards_list_by_user(?)',
        [userId]
      );
      const firstSet: any = Array.isArray(rows) ? rows[0] : rows;
      return Array.isArray(firstSet) ? firstSet : [];
    } finally {
      conn.release();
    }
  }

  async getCardByUserAndNumber(userId: number, cardNumber: string): Promise<EnergyCard | null> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'CALL sp_energy_cards_get_by_user_and_card(?, ?)',
        [userId, cardNumber]
      );
      const firstSet: any = Array.isArray(rows) ? rows[0] : rows;
      return Array.isArray(firstSet) && firstSet.length ? firstSet[0] : null;
    } finally {
      conn.release();
    }
  }

  async addCard(userId: number, cardNumber: string, name: string | null): Promise<EnergyCard> {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      
      const existingCard = await this.findCardByNumber(conn, cardNumber);
      if (existingCard) {
        if (existingCard.user_id == null) {
          await conn.query('CALL sp_energy_cards_claim_released_by_id(?, ?, ?)', [existingCard.id, userId, name]);
          const card = await this.getCardById(conn, existingCard.id);
          if (!card) {
            throw new Error('Failed to claim card');
          }
          return card;
        } else {
          throw new Error('Card number already exists');
        }
      } else {
        await conn.query('CALL sp_energy_cards_insert(?, ?, ?)', [userId, cardNumber, name]);
        const card = await this.getCardByUserAndNumber(userId, cardNumber);
        if (!card) {
          throw new Error('Failed to create card');
        }
        return card;
      }
      
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  async updateCardName(userId: number, cardNumber: string, name: string | null): Promise<EnergyCard> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'CALL sp_energy_cards_update_name_by_user_and_card(?, ?, ?)',
        [userId, cardNumber, name]
      );
      const affected = Number((rows[0] || {}).affected_rows || 0);
      if (affected === 0) {
        throw new Error('Card not found');
      }
      
      const card = await this.getCardByUserAndNumber(userId, cardNumber);
      if (!card) {
        throw new Error('Card not found');
      }
      return card;
    } finally {
      conn.release();
    }
  }

  async releaseCard(userId: number, cardNumber: string): Promise<void> {
    const conn = await this.pool.getConnection();
    try {
      const [rows]: any = await conn.query(
        'CALL sp_energy_cards_release_by_user_and_card(?, ?, ?)',
        [userId, cardNumber, userId]
      );
      const affected = Number((rows[0] || {}).affected_rows || 0);
      if (affected === 0) {
        throw new Error('Card not found');
      }
    } finally {
      conn.release();
    }
  }

  private async findCardByNumber(conn: any, cardNumber: string): Promise<any | null> {
    try {
      return await callFirst(conn, 'sp_energy_cards_find_by_card_number', [cardNumber]);
    } catch (e: any) {
      if (e?.code === 'ER_CANT_AGGREGATE_2COLLATIONS' || String(e?.sqlMessage || e?.message || '').includes('Illegal mix of collations')) {
        return await this.findCardByNumberRaw(conn, cardNumber);
      }
      throw e;
    }
  }

  private async findCardByNumberRaw(conn: any, cardNumber: string): Promise<any | null> {
    const [rows]: any = await conn.query(
      'SELECT id, user_id, card_number, name, current_balance, current_kwh, last_recharge, released, released_by_user_id, released_at ' +
      'FROM energy_cards ' +
      'WHERE card_number = CONVERT(? USING utf8mb4) COLLATE utf8mb4_general_ci ' +
      'LIMIT 1',
      [cardNumber]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  private async getCardById(conn: any, id: number): Promise<EnergyCard | null> {
    const [rows]: any = await conn.query(
      'SELECT * FROM energy_cards WHERE id = ?',
      [id]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }
}

async function callFirst<T = any>(conn: any, proc: string, params: any[] = []): Promise<T | null> {
  const sql = `CALL ${proc}(${params.map(() => '?').join(',')})`;
  const [rows]: any = await conn.query(sql, params);
  const firstSet: any = Array.isArray(rows) ? rows[0] : rows;
  return Array.isArray(firstSet) && firstSet.length ? firstSet[0] : null;
}