// Audit API
import { request } from './request';
import { AuditMetrics, KwhPriceHistoryEntry, EmployeeCodeRow, UserProfile, AdminUserRow } from './shared-types';

export type { UserProfile } from './shared-types';

export async function auditGetAdmins() {
  return request(`/api/audit/admins`) as Promise<{ admins: AdminUserRow[] }>;
}

export async function auditGetAdminProfile(userId: number) {
  return request(`/api/audit/admins/${userId}/profile`) as Promise<{ profile: UserProfile | null }>;
}

export async function auditUpdateAdminStatus(id: number, status: 'Activo' | 'Deshabilitado') {
  return request(`/api/audit/admins/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }) as Promise<{ message: string }>;
}

export async function auditGetEmployees() {
  return request(`/api/audit/employees`) as Promise<{ employees: AdminUserRow[] }>;
}

export async function auditGetEmployeeCodes() {
  return request(`/api/audit/employee-codes`) as Promise<{ codes: EmployeeCodeRow[] }>;
}

export async function auditGenerateEmployeeCode(role: 'admin' | 'audit') {
  return request(`/api/audit/employee-codes`, {
    method: 'POST',
    body: JSON.stringify({ role }),
  }) as Promise<{ id: number; code: string; role: 'admin' | 'audit' }>;
}

export async function auditGetMetrics(days = 30) {
  const url = `/api/audit/metrics/series?days=${days}`;
  return request(url) as Promise<AuditMetrics>;
}

export async function auditGetKwhPriceHistory() {
  return request(`/api/audit/kwh-price-history`) as Promise<{ history: KwhPriceHistoryEntry[] }>;
}