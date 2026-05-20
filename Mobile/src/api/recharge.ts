// Recharge API
import { request } from './request';

export type RechargeRequest = {
  amount?: number; // COP
  kwh?: number;
  card_number?: string;
};

export async function recharge(data: RechargeRequest) {
  return request('/api/recharge', {
    method: 'POST',
    body: JSON.stringify(data),
  }) as Promise<{
    pin_code: string;
    current_balance: number;
    current_kwh: number;
  }>;
}