import { api } from './instance';
import type { UserProfile } from './profile';

export type AdminUserRow = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  last_login: string | null;
  role: string | null;
  status: string | null;
};

export type AdminUserDetail = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  last_login: string | null;
  role: string | null;
  status: string | null;
  profile: UserProfile | null;
  logs: Array<{
    event_type: string;
    event_time: string;
    ip_address: string;
    details: string;
  }>;
  meters: Array<{
    card_number: string;
    name?: string | null;
    current_balance: number;
    current_kwh: number;
    linked_at: string;
  }>;
};

export async function adminListUsers() {
  const res = await api.get('/api/admin/users');
  return res.data as { users: AdminUserRow[] };
}

export async function adminGetUserDetail(id: number) {
  const res = await api.get(`/api/admin/users/${id}`);
  return res.data as { user: AdminUserDetail };
}

export async function adminGetUserLogs(id: number) {
  const res = await api.get(`/api/admin/users/${id}/logs`);
  return res.data as { logs: Array<{
    event_type: string;
    event_time: string;
    ip_address: string;
    details: string;
  }> };
}

export async function adminLinkMeterToUser(id: number, card_number: string) {
  const res = await api.post(`/api/admin/users/${id}/link`, { card_number });
  return res.data as { message: string };
}

export async function adminRemoveUserMeter(id: number, card_number: string) {
  const res = await api.delete(`/api/admin/users/${id}/${card_number}`);
  return res.data as { message: string };
}

export async function adminSendPasswordReset(id: number) {
  const res = await api.post(`/api/admin/users/${id}/send-reset`);
  return res.data as { message: string; link: string };
}

export async function adminUpdateUserEmail(id: number, email: string) {
  const res = await api.patch(`/api/admin/users/${id}/email`, { email });
  return res.data as { message: string };
}

export async function adminUpdateUserStatus(
  id: number,
  status: 'Activo' | 'Pausa' | 'Deshabilitado' | 'Suspendido'
) {
  const res = await api.patch(`/api/admin/users/${id}/status`, { status });
  return res.data as { message: string };
}

export async function adminSuspendUser(id: number) {
  const res = await api.post(`/api/admin/users/${id}/suspend`);
  return res.data as { message: string };
}

export async function adminUnsuspendUser(id: number) {
  const res = await api.post(`/api/admin/users/${id}/unsuspend`);
  return res.data as { message: string };
}

export async function adminUpdateKwhPrice(price: number) {
  const res = await api.post(`/api/admin/kwh-price`, { price });
  return res.data as { message: string; kwh_price: number };
}
