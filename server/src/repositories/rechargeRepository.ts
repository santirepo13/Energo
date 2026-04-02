import { DatabaseFunction } from '../database/databasePool';
import { RechargePin, RechargeTransaction } from '../models/rechargeModel';

export class RechargeRepository {
  constructor(private db: DatabaseFunction) {}

  async createPin(userId: number, cardNumber: string, pinCode: string, amount: number, kwh: number): Promise<number> {
    const [rows]: any = await this.db(
      'CALL sp_recharge_pins_insert(?, ?, ?, ?, ?)',
      [userId, cardNumber, pinCode, amount, kwh]
    );
    return rows[0].insertId;
  }

  async createTransaction(userId: number, cardNumber: string, amount: number, kwh: number): Promise<number> {
    const [rows]: any = await this.db(
      'CALL sp_recharge_transactions_insert(?, ?, ?, ?)',
      [userId, cardNumber, amount, kwh]
    );
    return rows[0].insertId;
  }

  async findByUserId(userId: number): Promise<RechargeTransaction[]> {
    const [rows]: any = await this.db(
      'CALL sp_recharge_pins_list_by_user(?)',
      [userId]
    );
    const resultSet = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    return Array.isArray(resultSet) ? resultSet : [];
  }

  async findByUserIdAndCardNumber(userId: number, cardNumber: string): Promise<RechargeTransaction[]> {
    const [rows]: any = await this.db(
      'CALL sp_recharge_pins_list_by_user_and_card(?, ?)',
      [userId, cardNumber]
    );
    return Array.isArray(rows) ? rows : [];
  }

  async getKwhPrice(): Promise<number> {
    const [rows]: any = await this.db(
      'CALL sp_settings_get(?)',
      ['cost_per_kwh']
    );
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
}