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
        'SELECT amount, kwh FROM recharge_pins WHERE pin_code = ? AND user_id = ?',
        [pinCode, userId]
      );
      
      if (!Array.isArray(pinResult) || pinResult.length === 0) {
        throw new Error('Invalid pin code');
      }
      
      const pinData = pinResult[0];
      const calculatedAmount = pinData.amount;
      const calculatedKwh = pinData.kwh;

      if (!Number.isFinite(calculatedAmount) || !Number.isFinite(calculatedKwh)) {
        throw new Error('Invalid pin data: amount and kwh must be finite numbers');
      }
      
      const newBalance = card.current_balance + calculatedAmount;
      const newKwh = card.current_kwh + calculatedKwh;
      
      const roundedNewKwh = Math.round(newKwh * 100) / 100;
      
      const [updateResult]: any = await conn.query('CALL sp_energy_cards_update_balance(?, ?, ?, ?)', [userId, cardNumber, newBalance, roundedNewKwh]);
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
      if (!Number.isFinite(kwhPrice) || kwhPrice <= 0) {
        throw new Error('Invalid KWh price: must be a valid positive number');
      }
      calculatedKwh = Math.round((amount / kwhPrice) * 100) / 100;
    } else if (kwh !== undefined && amount === undefined) {
      // kWh provided, calculate amount
      const kwhPrice = await this.getKwhPrice(conn);
      if (!Number.isFinite(kwhPrice) || kwhPrice <= 0) {
        throw new Error('Invalid KWh price: must be a valid positive number');
      }
      calculatedAmount = Math.round((kwh * kwhPrice) * 100) / 100;
    } else if (amount === undefined && kwh === undefined) {
      throw new Error('Either amount or kwh must be provided');
    }
    
    // Validate calculated values are valid numbers immediately after calculation
    if (!Number.isFinite(calculatedAmount) || !Number.isFinite(calculatedKwh)) {
      throw new Error('Invalid calculated values: amount and kwh must be finite numbers');
    }
    
    // Validate calculated kWh does not exceed database limits
    if (calculatedKwh > 99999999.99) {
      throw new Error('Calculated kWh exceeds maximum allowed value');
    }
    
    const newBalance = card.current_balance + calculatedAmount;
    const newKwh = card.current_kwh + calculatedKwh;
    
    const roundedNewKwh = Math.round(newKwh * 100) / 100;
    
    const [updateResult]: any = await conn.query('CALL sp_energy_cards_update_balance(?, ?, ?, ?)', [userId, cardNumber, newBalance, roundedNewKwh]);
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

    if (!Number.isFinite(calculatedAmount) || !Number.isFinite(calculatedKwh)) {
      throw new Error('Invalid calculated values: amount and kwh must be finite numbers');
    }

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
    const [rows]: any = await conn.query('SELECT value FROM settings WHERE \`key\` = ?', ['cost_per_kwh']);
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('KWh price not found in settings');
    }
    const parsedValue = parseFloat(rows[0].value);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      throw new Error('Invalid KWh price: must be a positive number');
    }
    return parsedValue;
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