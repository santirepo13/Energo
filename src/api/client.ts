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
  card_number?: string; // optional: target a specific meter
};

export type UserInfo = {
  username: string;
  role: string | null;
  status: string | null;
};

export type DashboardResponse = {
  current_user?: UserInfo;
  // Back-compat: first card (may be null)
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

// ==== Auditor Types & API ====

export type AuditMetrics = {
  totals: {
    codes_sold: number;
    amount_cop: number;
    kwh: number;
  };
  by_day: Array<{
    day: string;           // YYYY-MM-DD
    codes_sold: number;
    amount_cop: number;
    kwh: number;
  }>;
};

export async function auditListAdmins() {
  const res = await api.get('/audit/admins');
  return res.data as { users: AdminUserRow[] };
}

export async function auditUpdateStatus(
  id: number,
  status: 'Activo' | 'Pausa' | 'Deshabilitado' | 'Suspendido'
) {
  const res = await api.patch(`/audit/users/${id}/status`, { status });
  return res.data as { message: string };
}

export async function auditGetMetrics(days = 30) {
  const res = await api.get('/audit/metrics', { params: { days } });
  return res.data as AuditMetrics;
}

export async function adminUpdateKwhPrice(price: number) {
  const res = await api.post('/admin/kwh-price', { price });
  return res.data as { message: string; cost_per_kwh: number };
}


// ==== Audit Employees (admin + audit) and Employee Codes API ====

export type EmployeeCodeRow = {
  id: number;
  code: string;
  role: string | null;
  used: number | boolean;
  created_at: string;
  used_at: string | null;
};

export async function auditListEmployees() {
  const res = await api.get('/audit/employees');
  return res.data as { users: AdminUserRow[] };
}

export async function auditListEmployeeCodes() {
  const res = await api.get('/audit/employee-codes');
  return res.data as { codes: EmployeeCodeRow[] };
}

export async function auditGenerateEmployeeCode(role: 'admin' | 'audit') {
  const res = await api.post('/audit/employee-codes', { role });
  return res.data as { id: number; code: string; role: 'admin' | 'audit' };
}

// ==== Perfil de usuario (self-service) ====

// Datos del perfil (tabla user_profiles)
export type UserProfile = {
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  tipo_identificacion: string;      // 'CC' | 'CE' | 'Pasaporte' | 'PEP' | 'RIF' | ...
  numero_identificacion: string;
  direccion: string | null;
  telefono: string | null;
};

// Respuesta de GET /api/me/profile
export type MeProfileResponse = {
  username: string;
  email: string;           // correo de registro (solo lectura en UI)
  profile: UserProfile | null;
};

// Obtener perfil propio
export async function meGetProfile() {
  const res = await api.get('/me/profile');
  return res.data as MeProfileResponse;
}

// Crear/Actualizar perfil propio
export type UpdateProfileRequest = {
  primer_nombre: string;
  segundo_nombre?: string | null;
  primer_apellido: string;
  segundo_apellido?: string | null;
  tipo_identificacion: string;
  numero_identificacion: string;
  direccion?: string | null;
  telefono?: string | null;
};

export async function meUpdateProfile(data: UpdateProfileRequest) {
  const res = await api.put('/me/profile', data);
  return res.data as { message: string };
}

// Cambiar contraseña (valida política en backend)
export async function meChangePassword(current_password: string, new_password: string) {
  const res = await api.post('/me/password-change', { current_password, new_password });
  return res.data as { message: string };
}

// Actualizar estado de la cuenta (Pausa o Deshabilitado)
export type SelfStatus = 'Pausa' | 'Deshabilitado';

export async function meUpdateStatus(status: SelfStatus) {
  const res = await api.post('/me/status', { status });
  return res.data as { message: string };
}

// Mock verification to restore a paused account (lab-only)
export async function mockPausaVerify(username: string) {
  const res = await api.post('/mock/pausa/verify', { username });
  return res.data as { message: string };
}

// ==== User meters (self-service) ====

export type UserMeter = {
  card_number: string;
  name?: string | null;
  current_balance: number;
  current_kwh: number;
  last_recharge: string | null;
};

export async function meListMeters() {
  const res = await api.get('/me/meters');
  return res.data as { meters: UserMeter[] };
}

export async function meAddMeter(card_number: string, name?: string) {
  const body: any = { card_number };
  if (name && name.trim()) body.name = name.trim();
  const res = await api.post('/me/meters', body);
  return res.data as { meter: UserMeter };
}

export async function meReleaseMeter(card_number: string) {
  const res = await api.delete(`/me/meters/${encodeURIComponent(card_number)}`);
  return res.data as { message: string };
}

// Edit meter name
export async function meRenameMeter(card_number: string, name: string | null) {
  const res = await api.patch(`/me/meters/${encodeURIComponent(card_number)}`, { name });
  return res.data as { meter: UserMeter };
}
