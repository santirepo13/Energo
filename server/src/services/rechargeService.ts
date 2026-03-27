import { Pool } from 'mysql2/promise';
import { RechargePin, RechargeTransaction } from '../models/rechargeModel';
import * as crypto from 'crypto';

console.log('Loading recharge service');

export class RechargeService {
  constructor(private pool: Pool) {}

  async recharge(userId: number, amount: number, kwh: number, cardNumber: string, pinCode?: string): Promise<{ pin: string; balance: number; kwh: number }> {
  const conn = await this.pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const card = await this.getCardForRecharge(conn, userId, cardNumber);
    if (!card) {
      throw new Error('No energy card for user with that card_number');
    }
    
    // Handle pin code recharge flow
    if (pinCode) {
      // For pin code recharges, use the provided balance and kwh values
      const [pinResult]: any = await conn.query(
        'SELECT amount_cop, kwh FROM recharge_pins WHERE pin_code = ? AND user_id = ? AND used = 0',
        [pinCode, userId]
      );
      
      if (!Array.isArray(pinResult) || pinResult.length === 0) {
        throw new Error('Invalid or already used pin code');
      }
      
      const pinData = pinResult[0];
      const calculatedAmount = pinData.amount_cop;
      const calculatedKwh = pinData.kwh;
      
      const newBalance = card.current_balance + calculatedAmount;
      const newKwh = card.current_kwh + calculatedKwh;
      
      const [updateResult]: any = await conn.query('CALL sp_energy_cards_update_balance(?, ?, ?, ?)', [userId, cardNumber, newBalance, newKwh]);
      const affectedRows = Array.isArray(updateResult) && updateResult[0] && typeof updateResult[0][0]?.affected_rows === 'number' 
        ? updateResult[0][0].affected_rows 
        : 0;
      
      if (affectedRows !== 1) {
        throw new Error('Failed to update energy card balance: no rows affected');
      }
      
      // Mark the pin as used
      await conn.query('UPDATE recharge_pins SET used = 1, used_at = NOW() WHERE pin_code = ?', [pinCode]);
      
      // Fetch the actual updated balance from the database
      const [updatedCardResult]: any = await conn.query(
        'SELECT current_balance, current_kwh FROM energy_cards WHERE user_id = ? AND card_number = ?',
        [userId, cardNumber]
      );
      
      if (!Array.isArray(updatedCardResult) || updatedCardResult.length === 0) {
        throw new Error('Failed to retrieve updated card balance');
      }
      
      const actualBalance = updatedCardResult[0].current_balance;
      const actualKwh = updatedCardResult[0].current_kwh;
      
      await conn.commit();
      return { pin: pinCode, balance: actualBalance, kwh: actualKwh };
    }
    
    // Original amount/kwh recharge flow
    // Calculate the missing value based on the provided one
    let calculatedAmount = amount;
    let calculatedKwh = kwh;
    
    if (amount !== undefined && kwh === undefined) {
      // Amount provided, calculate kWh
      const kwhPrice = await this.getKwhPrice(conn);
      calculatedKwh = amount / kwhPrice;
    } else if (kwh !== undefined && amount === undefined) {
      // kWh provided, calculate amount
      const kwhPrice = await this.getKwhPrice(conn);
      calculatedAmount = kwh * kwhPrice;
    } else if (amount === undefined && kwh === undefined) {
      throw new Error('Either amount or kwh must be provided');
    }
    
    const newBalance = card.current_balance + calculatedAmount;
    const newKwh = card.current_kwh + calculatedKwh;
    
    const [updateResult]: any = await conn.query('CALL sp_energy_cards_update_balance(?, ?, ?, ?)', [userId, cardNumber, newBalance, newKwh]);
    const affectedRows = Array.isArray(updateResult) && updateResult[0] && typeof updateResult[0][0]?.affected_rows === 'number' 
      ? updateResult[0][0].affected_rows 
      : 0;
    
    if (affectedRows !== 1) {
      throw new Error('Failed to update energy card balance: no rows affected');
    }
    
    // Fetch the actual updated balance from the database
    const [updatedCardResult]: any = await conn.query(
      'SELECT current_balance, current_kwh FROM energy_cards WHERE user_id = ? AND card_number = ?',
      [userId, cardNumber]
    );
    
    if (!Array.isArray(updatedCardResult) || updatedCardResult.length === 0) {
      throw new Error('Failed to retrieve updated card balance');
    }
    
    const actualBalance = updatedCardResult[0].current_balance;
    const actualKwh = updatedCardResult[0].current_kwh;
    
    const pin = this.generateSts20Token(card.card_number, calculatedAmount, calculatedKwh);
    await conn.query('CALL sp_recharge_pins_insert(?, ?, ?, ?, ?)', [userId, cardNumber, pin, calculatedAmount, calculatedKwh]);
    
    await conn.commit();
    return { pin, balance: actualBalance, kwh: actualKwh };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

  async getRechargeHistory(userId: number): Promise<RechargeTransaction[]> {
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

  private async getCardForRecharge(conn: any, userId: number, cardNumber: string): Promise<any> {
    try {
      return await callFirst(conn, 'sp_energy_cards_select_by_user_and_card_for_update', [userId, cardNumber]);
    } catch (e: any) {
      if (e?.code === 'ER_CANT_AGGREGATE_2COLLATIONS' || String(e?.sqlMessage || e?.message || '').includes('Illegal mix of collations')) {
        return await this.getCardForRechargeRaw(conn, userId, cardNumber);
      }
      throw e;
    }
  }

  private async getCardForRechargeRaw(conn: any, userId: number, cardNumber: string): Promise<any> {
    const [rows]: any = await conn.query(
      'SELECT id, user_id, card_number, current_balance, current_kwh, last_recharge FROM energy_cards ' +
      'WHERE user_id = ? AND card_number = ? FOR UPDATE',
      [userId, cardNumber]
    );
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  private generateSts20Token(cardNumber: string, amountCOP: number, kwh: number): string {
    const STS_BASE_DATE = new Date(Date.UTC(1993, 0, 1));
    
    const key = this.deriveMeterKey(cardNumber);
    const tokenType = 0x01;
    const amountCents = Math.max(0, Math.round(amountCOP * 100));
    const days = this.daysSinceStsEpoch(new Date());
    const nonce = Math.floor(Math.random() * 65536);

    const payload = Buffer.alloc(9);
    payload.writeUInt8(tokenType, 0);
    payload.writeUInt32BE(amountCents >>> 0, 1);
    payload.writeUInt16BE(days & 0xffff, 5);
    payload.writeUInt16BE(nonce, 7);

    const mac = crypto.createHmac('sha256', key).update(payload).digest();
    const first16 = mac.subarray(0, 16);
    const big = BigInt('0x' + first16.toString('hex'));
    const body = (big % (10n ** 19n)).toString().padStart(19, '0');
    const check = this.luhnCheckDigit(body);
    return body + check;
  }

  private deriveMeterKey(cardNumber: string): Buffer {
    const master = process.env.STS_MASTER_KEY || process.env.SESSION_SECRET || 'insecure-dev-sts-key';
    return crypto.createHmac('sha256', master).update(String(cardNumber)).digest().subarray(0, 16);
  }

  private daysSinceStsEpoch(d: Date): number {
    const STS_BASE_DATE = new Date(Date.UTC(1993, 0, 1));
    const ms = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - STS_BASE_DATE.getTime();
    return Math.max(0, Math.floor(ms / 86400000));
  }

  private async getKwhPrice(conn: any): Promise<number> {
    try {
      const [rows]: any = await conn.query('SELECT value FROM settings WHERE key = ?', ['cost_per_kwh']);
      return Array.isArray(rows) && rows.length ? parseFloat(rows[0].value) : 0;
    } catch (e) {
      // Fallback to a default price if the query fails
      return 0.0005; // Default price per kWh
    }
  }

  private luhnCheckDigit(bodyDigits: string): string {
    let sum = 0;
    for (let i = bodyDigits.length - 1, alt = 0; i >= 0; i--, alt ^= 1) {
      let n = bodyDigits.charCodeAt(i) - 48;
      if (alt === 1) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
    }
    const check = (10 - (sum % 10)) % 10;
    return String(check);
  }
}

async function callFirst<T = any>(conn: any, proc: string, params: any[] = []): Promise<T | null> {
  const sql = `CALL ${proc}(${params.map(() => '?').join(',')})`;
  const [rows]: any = await conn.query(sql, params);
  const firstSet: any = Array.isArray(rows) ? rows[0] : rows;
  return Array.isArray(firstSet) && firstSet.length ? firstSet[0] : null;
}