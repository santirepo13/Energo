import { Pool } from 'mysql2/promise';
import { RechargePin, RechargeTransaction } from '../models/rechargeModel';
import * as crypto from 'crypto';

console.log('Loading recharge service');

export class RechargeService {
  constructor(private pool: Pool) {}

  async recharge(userId: number, amount: number, kwh: number, cardNumber: string, pinCode?: string): Promise