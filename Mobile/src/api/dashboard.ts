// Dashboard and profile API
import { request } from './request';
import { UserProfile, CardInfo, RechargeHistoryEntry, SecurityLogEntry } from './shared-types';

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
  cards?: Array<CardInfo>;
  recharge_history: Array<RechargeHistoryEntry>;
  security_logs: Array<SecurityLogEntry>;
  kwh_price: number;
};

export async function getDashboard() {
  return request('/api/user/profile') as Promise<DashboardResponse>;
}

export async function health() {
  return request('/api/health') as Promise<{ status: string }>;
}