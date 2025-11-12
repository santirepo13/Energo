import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  password: string;
  email: string;
  card_number: string;
  employee_code?: string; // optional employee code for admin/audit registration
};

export type RechargeRequest = {
  amount?: number; // COP
  kwh?: number;
};

export type UserInfo = {
  username: string;
  role: string | null;
  status: string | null;
};

export type DashboardResponse = {
  current_user?: UserInfo;
  card: {
    card_number: string;
    current_balance: number;
    current_kwh: number;
  } | null;
  recharge_history: Array<{
    pin_code: string;
    amount: number;
    kwh: number;
    created_at: string;
    card_number: string;
  }>;
  security_logs: Array<{
    event_type: string;
    event_time: string;
    ip_address: string;
    details: string;
  }>;
  cost_per_kwh: number;
};

export async function login(data: LoginRequest) {
  const res = await api.post('/login', data);
  return res.data as { message: string };
}

export async function registerUser(data: RegisterRequest) {
  const res = await api.post('/register', data);
  return res.data as { message: string } | { error: string };
}

export async function getDashboard() {
  const res = await api.get('/dashboard');
  return res.data as DashboardResponse;
}

export async function recharge(data: RechargeRequest) {
  const res = await api.post('/recharge', data);
  return res.data as {
    pin_code: string;
    card_number: string;
    current_balance: number;
    current_kwh: number;
  };
}

export async function health() {
  const res = await api.get('/health');
  return res.data as { status: string };
}

export type AdminUserRow = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  last_login: string | null;
  role: string | null;
  status: string | null;
};

export async function adminListUsers() {
  const res = await api.get('/admin/users');
  return res.data as { users: AdminUserRow[] };
}

export async function adminUpdateEmail(id: number, email: string) {
  const res = await api.patch(`/admin/users/${id}/email`, { email });
  return res.data as { message: string };
}

export async function adminUpdateStatus(
  id: number,
  status: 'Activo' | 'Pausa' | 'Deshabilitado' | 'Suspendido'
) {
  const res = await api.patch(`/admin/users/${id}/status`, { status });
  return res.data as { message: string };
}

export async function adminSendReset(id: number) {
  const res = await api.post(`/admin/users/${id}/send-reset`);
  return res.data as { message: string; link: string };
}