import { api } from './instance';
import type { UserProfile } from './profile';

export type AuditMetrics = {
  totals: {
    codes_sold: number;
    amount_cop: number;
    kwh: number;
  };
  by_day: Array<{
    day: string;
    codes_sold: number;
    amount_cop: number;
    kwh: number;
  }>;
};

export type KwhPriceHistoryEntry = {
  id: number;
  admin_user_id: number;
  admin_username: string | null;
  price_cop: number;
  created_at: string;
};

export type EmployeeCodeRow = {
  id: number;
  code: string;
  role: string | null;
  used: number | boolean;
  created_at: string;
  used_at: string | null;
  used_by_username?: string | null;
};

export async function auditGetAdmins() {
  const res = await api.get(`/api/audit/admins`);
  return res.data as { admins: AdminUserRow[] };
}

export async function auditGetAdminProfile(userId: number) {
  const res = await api.get(`/api/audit/admins/${userId}/profile`);
  return res.data as { profile: UserProfile | null };
}

export async function auditUpdateAdminStatus(
  id: number,
  status: 'Activo' | 'Deshabilitado'
) {
  const res = await api.patch(`/api/audit/admins/${id}/status`, { status });
  return res.data as { message: string };
}

export async function auditGetEmployees() {
  const res = await api.get(`/api/audit/employees`);
  return res.data as { employees: AdminUserRow[] };
}

export async function auditGetEmployeeCodes() {
  const res = await api.get(`/api/audit/employee-codes`);
  return res.data as { codes: EmployeeCodeRow[] };
}

export async function auditGenerateEmployeeCode(role: 'admin' | 'audit') {
  const res = await api.post(`/api/audit/employee-codes`, { role });
  return res.data as { id: number; code: string; role: 'admin' | 'audit' };
}

export async function auditGetMetrics(days = 30) {
  const res = await api.get(`/api/audit/metrics/series`, { params: { days } });
  return res.data as AuditMetrics;
}

export async function auditGetKwhPriceHistory() {
  const res = await api.get(`/api/audit/kwh-price-history`);
  return res.data as { history: KwhPriceHistoryEntry[] };
}

// Re-export AdminUserRow from admin module to avoid circular dependency
export type AdminUserRow = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  last_login: string | null;
  role: string | null;
  status: string | null;
};
