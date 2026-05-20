import { api } from './instance';
import type { UserProfile } from './profile';

export type UserInfo = {
  username: string;
  role: string | null;
  status: string | null;
};

export type DashboardResponse = {
  user?: UserInfo;
  profile?: UserProfile | null;
  personal_data_filled?: boolean;
  // Back-compat: first card
  card: {
    card_number: string;
    name?: string | null;
    current_balance: number;
    current_kwh: number;
  } | null;
  // New: full list of meters for the user
  cards?: Array<{
    card_number: string;
    name?: string | null;
    current_balance: number;
    current_kwh: number;
  }>;
  recharge_history: Array<{
    user_id?: number;
    email?: string | null;
    pin_code: string;
    amount: number;
    kwh: number;
    kwh_price_at_time?: number | null;
    created_at: string;
    card_number: string;
  }>;
  security_logs: Array<{
    event_type: string;
    event_time: string;
    ip_address: string;
    details: string;
  }>;
  kwh_price: number;
};

export async function getDashboard() {
  const res = await api.get('/api/user/profile');
  return res.data as DashboardResponse;
}

export async function health() {
  const res = await api.get('/api/health');
  return res.data as { status: string };
}
