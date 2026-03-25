export interface RechargePin {
  id: number;
  user_id: number;
  card_number: string;
  pin_code: string;
  amount: number;
  kwh: number;
  created_at: Date;
}

export interface RechargeTransaction {
  id: number;
  user_id: number;
  card_number: string;
  amount: number;
  kwh: number;
  created_at: Date;
}