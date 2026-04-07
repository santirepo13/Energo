import { DatabaseFunction } from '../database/databasePool';
import { RechargePin, RechargeTransaction } from '../models/rechargeModel';

export class RechargeRepository {
  constructor(private db: DatabaseFunction) {}

  async createPin(userId: number, cardNumber: string, pinCode: string, amount: number, kwh: number): Promise<number> {
    const [rows]: any = await this.db(
      'CALL sp_recharge_pins_insert(?, ?, ?, ?, ?)',
      [userId, cardNumber, pinCode, amount, kwh]
    );
    // Stored procedures without explicit SELECT return OkPacket in rows[1]
    // rows structure: [ResultSet, OkPacket] - need rows[1].insertId for INSERT-only procedures
    const okPacket = Array.isArray(rows) && rows.length > 1 ? rows[1] : rows[0];
    const insertedId = Number(okPacket && okPacket.insertId !== undefined ? okPacket.insertId : undefined);
    if (!Number.isInteger(insertedId) || insertedId <= 0) {
      throw new Error('Failed to retrieve inserted recharge pin ID');
    }
    return insertedId;
  }

  async createTransaction(userId: number, cardNumber: string, amount: number, kwh: number): Promise<number> {
    const [rows]: any = await this.db(
      'CALL sp_recharge_transactions_insert(?, ?, ?, ?)',
      [userId, cardNumber, amount, kwh]
    );
    // Stored procedures without explicit SELECT return OkPacket in rows[1]
    // rows structure: [ResultSet, OkPacket] - need rows[1].insertId for INSERT-only procedures
    const okPacket = Array.isArray(rows) && rows.length > 1 ? rows[1] : rows[0];
    const insertedId = Number(okPacket && okPacket.insertId !== undefined ? okPacket.insertId : undefined);
    if (!Number.isInteger(insertedId) || insertedId <= 0) {
      throw new Error('Failed to retrieve inserted recharge transaction ID');
    }
    return insertedId;
  }

  async findByUserId(userId: number): Promise<RechargeTransaction[]> {
    const [rows]: any = await this.db(
      'CALL sp_recharge_pins_list_by_user(?)',
      [userId]
    );
    const resultSet = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    return Array.isArray(resultSet) ? resultSet : [];
  }

  async findAll(): Promise<RechargeTransaction[]> {
    const [rows]: any = await this.db(
      'CALL sp_recharge_pins_list_all()'
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
      ['kwh_price']
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