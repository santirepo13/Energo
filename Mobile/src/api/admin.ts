// Admin API
import { request } from './request';
import { UserProfile, SecurityLogEntry, CardInfo } from './shared-types';

export async function adminListUsers() {
  return request('/api/admin/users') as Promise<{ users: Array<{
    id: number;
    username: string;
    email: string;
    created_at: string;
    last_login: string | null;
    role: string | null;
    status: string | null;
  }> }>;
}

// Admin user detail
export type AdminUserDetail = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  last_login: string | null;
  role: string | null;
  status: string | null;
  profile: UserProfile | null;
  logs: Array<SecurityLogEntry>;
  meters: Array<CardInfo & { linked_at: string }>;
};

export async function adminGetUserDetail(id: number) {
  return request(`/api/admin/users/${id}`) as Promise<{ user: AdminUserDetail }>;
}

export async function adminGetUserLogs(id: number) {
  return request(`/api/admin/users/${id}/logs`) as Promise<{ logs: Array<SecurityLogEntry> }>;
}

export async function adminLinkMeterToUser(id: number, card_number: string) {
  return request(`/api/admin/users/${id}/link`, {
    method: 'POST',
    body: JSON.stringify({ card_number }),
  }) as Promise<{ message: string }>;
}

export async function adminRemoveUserMeter(id: number, card_number: string) {
  return request(`/api/admin/users/${id}/${card_number}`, {
    method: 'DELETE',
  }) as Promise<{ message: string }>;
}

export async function adminSendPasswordReset(id: number) {
  return request(`/api/admin/users/${id}/send-reset`, {
    method: 'POST',
  }) as Promise<{ message: string; link: string }>;
}

export async function adminUpdateUserEmail(id: number, email: string) {
  return request(`/api/admin/users/${id}/email`, {
    method: 'PATCH',
    body: JSON.stringify({ email }),
  }) as Promise<{ message: string }>;
}

export async function adminUpdateUserStatus(id: number, status: 'Activo' | 'Pausa' | 'Deshabilitado' | 'Suspendido') {
  return request(`/api/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }) as Promise<{ message: string }>;
}

export async function adminSuspendUser(id: number) {
  return request(`/api/admin/users/${id}/suspend`, {
    method: 'POST',
  }) as Promise<{ message: string }>;
}

export async function adminUnsuspendUser(id: number) {
  return request(`/api/admin/users/${id}/unsuspend`, {
    method: 'POST',
  }) as Promise<{ message: string }>;
}

export async function adminUpdateKwhPrice(price: number) {
  return request(`/api/admin/kwh-price`, {
    method: 'POST',
    body: JSON.stringify({ price }),
  }) as Promise<{ message: string; kwh_price: number }>;
}