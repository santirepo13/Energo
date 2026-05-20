import { api } from './instance';

export type RechargeRequest = {
  amount?: number; // COP
  kwh?: number;
  card_number?: string;
};

export async function recharge(data: RechargeRequest) {
  const res = await api.post('/api/recharge', data);
  return res.data as {
    pin_code: string;
    current_balance: number;
    current_kwh: number;
  };
}
