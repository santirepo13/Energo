import { DatabaseFunction } from '../database/databasePool';
import { RechargePin, RechargeTransaction } from '../models/rechargeModel';
import { RechargeRepository } from '../repositories/rechargeRepository';
import * as crypto from 'crypto';

console.log('Cargando servicio de recarga');

export class RechargeService {
  private rechargeRepository: RechargeRepository;

  constructor(private db: DatabaseFunction) {
    this.rechargeRepository = new RechargeRepository(db);
  }

  async recharge(userId: number, amount: number, kwh: number, cardNumber: string, pinCode?: string): Promise<{ pin: string; balance: number; kwh: number }> {
    // Since we're using the new abstraction, we don't need to manage connections manually
    const card = await this.getCardForRecharge(userId, cardNumber);
    if (!card) {
      throw new Error('No energy card for user with that card_number');
    }
    
    // Original amount/kwh recharge flow
    // Calculate the missing value based on the provided one
    let calculatedAmount = amount;
    let calculatedKwh = kwh;
    let usedKwhPrice = 0;
    
    if (amount !== undefined && kwh === undefined) {
      // Amount provided, calculate kWh
      const kwhPrice = await this.getKwhPrice();
      if (!Number.isFinite(kwhPrice) || kwhPrice <= 0) {
        throw new Error('Invalid KWh price: must be a valid positive number');
      }
      usedKwhPrice = kwhPrice;
      calculatedKwh = Math.round((amount / kwhPrice) * 100) / 100;
    } else if (kwh !== undefined && amount === undefined) {
      // kWh provided, calculate amount
      const kwhPrice = await this.getKwhPrice();
      if (!Number.isFinite(kwhPrice) || kwhPrice <= 0) {
        throw new Error('Invalid KWh price: must be a valid positive number');
      }
      usedKwhPrice = kwhPrice;
      calculatedAmount = Math.round((kwh * kwhPrice) * 100) / 100;
    } else if (amount === undefined && kwh === undefined) {
      throw new Error('Either amount or kwh must be provided');
    } else {
      // Both provided - derive price from values
      usedKwhPrice = calculatedKwh > 0 ? Math.round((calculatedAmount / calculatedKwh) * 100) / 100 : 0;
    }
    
    // Validate calculated values are valid numbers immediately after calculation
    if (!Number.isFinite(calculatedAmount) || !Number.isFinite(calculatedKwh)) {
      throw new Error('Invalid calculated values: amount and kwh must be finite numbers');
    }
    
    // Guard against NaN values that could be generated during calculations
    if (isNaN(calculatedAmount) || isNaN(calculatedKwh)) {
      throw new Error('Invalid calculated values: amount and kwh must be valid numbers');
    }
    
    // Validate calculated kWh does not exceed database limits
    if (calculatedKwh > 99999999.99) {
      throw new Error('Calculated kWh exceeds maximum allowed value');
    }
    
    const newBalance = Number(card.current_balance) + calculatedAmount;
    const newKwh = Number(card.current_kwh) + calculatedKwh;
    
    const roundedNewKwh = Math.round(newKwh * 100) / 100;
    
    if (!Number.isFinite(newBalance) || !Number.isFinite(roundedNewKwh)) {
      throw new Error('Invalid card balance or kwh values');
    }
    
    await this.db('CALL sp_energy_cards_update_balance(?, ?, ?, ?)', [userId, cardNumber, newBalance, roundedNewKwh]);
    
    // Fetch the actual updated balance from the database
    const [updatedCardResult]: any = await this.db(
      'SELECT current_balance, current_kwh FROM energy_cards WHERE user_id = ? AND card_number = ?',
      [userId, cardNumber]
    );
    
    if (!Array.isArray(updatedCardResult) || updatedCardResult.length === 0) {
      throw new Error('Failed to retrieve updated card balance');
    }
    
    const actualBalance = updatedCardResult[0].current_balance;
    const actualKwh = updatedCardResult[0].current_kwh;

    const pin = this.generateSts20Token(card.card_number, calculatedAmount, calculatedKwh);

    await this.db('CALL sp_recharge_pins_insert(?, ?, ?, ?, ?, ?)', [userId, cardNumber, pin, calculatedAmount, calculatedKwh, usedKwhPrice]);
    
    return { pin, balance: actualBalance, kwh: actualKwh };
  }

  async getRechargeHistory(userId: number): Promise<RechargeTransaction[]> {
    return await this.rechargeRepository.findByUserId(userId);
  }

  async getAllRechargeHistory(): Promise<RechargeTransaction[]> {
    return await this.rechargeRepository.findAll();
  }

  private async getCardForRecharge(userId: number, cardNumber: string): Promise<any> {
    try {
      return await callFirst(this.db, 'sp_energy_cards_select_by_user_and_card_for_update', [userId, cardNumber]);
    } catch (e: any) {
      if (e?.code === 'ER_CANT_AGGREGATE_2COLLATIONS' || String(e?.sqlMessage || e?.message || '').includes('Illegal mix of collations')) {
        return await this.getCardForRechargeRaw(userId, cardNumber);
      }
      throw e;
    }
  }

  private async getCardForRechargeRaw(userId: number, cardNumber: string): Promise<any> {
    const [rows]: any = await this.db(
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

  async getKwhPrice(): Promise<number> {
    const [rows]: any = await this.db('CALL sp_settings_get(?)', ['kwh_price']);
    const firstSet: any = Array.isArray(rows) ? rows[0] : rows;
    if (!Array.isArray(firstSet) || firstSet.length === 0) {
      throw new Error('KWh price not found in settings');
    }
    const parsedValue = parseFloat(firstSet[0].value);
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

async function callFirst<T = any>(db: DatabaseFunction, proc: string, params: any[] = []): Promise<T | null> {
  const [rows]: any = await db(`CALL ${proc}(${params.map(() => '?').join(',')})`, params);
  const firstSet: any = Array.isArray(rows) ? rows[0] : rows;
  return Array.isArray(firstSet) && firstSet.length ? firstSet[0] : null;
}
