import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
  employee_code?: string; 
};

export type RechargeRequest = {
  amount?: number; // COP
  kwh?: number;
  card_number?: string; 
};

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

export async function login(data: LoginRequest) {
  const res = await api.post('/api/auth/login', data);
  return res.data as { message: string };
}

export async function registerUser(data: RegisterRequest) {
  const res = await api.post('/api/auth/register', data);
  return res.data as { message: string } | { error: string };
}

export async function getDashboard() {
  const res = await api.get('/api/user/profile');
  return res.data as DashboardResponse;
}

export async function recharge(data: RechargeRequest) {
  const res = await api.post('/api/recharge', data);
  return res.data as {
    pin_code: string;
    current_balance: number;
    current_kwh: number;
  };
}

export async function health() {
  const res = await api.get('/api/health');
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
  const res = await api.get('/api/admin/users');
  return res.data as { users: AdminUserRow[] };
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

export type KwhPriceHistoryEntry = {
  id: number;
  admin_user_id: number;
  admin_username: string | null;
  price_cop: number;
  created_at: string;
};

// ==== Audit Employees (admin + audit) and Employee Codes API ====

export type EmployeeCodeRow = {
  id: number;
  code: string;
  role: string | null;
  used: number | boolean;
  created_at: string;
  used_at: string | null;
  used_by_username?: string | null;
};




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

// Respuesta de GET /me/profile
export type MeProfileResponse = {
  username: string;
  email: string;           // correo de registro (solo lectura en UI)
  profile: UserProfile | null;
  personal_data_filled?: boolean; // bandera desde BD: 1 cuando ya llenó dirección y teléfono al menos una vez
  cards?: Array<{
    card_number: string;
    name?: string | null;
    current_balance: number;
    current_kwh: number;
  }>;
  recharge_history?: Array<{
    user_id?: number;
    email?: string | null;
    pin_code: string;
    amount: number;
    kwh: number;
    kwh_price_at_time?: number | null;
    created_at: string;
    card_number: string;
  }>;
};

// Obtener perfil propio
export async function meGetProfile() {
  const res = await api.get('/api/user/profile');
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
  const res = await api.put('/api/user/profile', data);
  return res.data as { message: string };
}

// Cambiar contraseña (valida política en backend)
export async function meChangePassword(current_password: string, new_password: string) {
  const res = await api.post('/api/user/password-change', { current_password, new_password });
  return res.data as { message: string };
}

// Actualizar estado de la cuenta (Pausa o Deshabilitado)
export type SelfStatus = 'Pausa' | 'Deshabilitado';

export async function meUpdateStatus(status: SelfStatus) {
  const res = await api.post('/api/user/status', { status });
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
  const res = await api.get('/api/meters');
  return res.data as { meters: UserMeter[] };
}

export async function meAddMeter(card_number: string, name?: string) {
  const body: any = { card_number };
  if (name && name.trim()) body.name = name.trim();
  const res = await api.post('/api/meters', body);
  return res.data as { meter: UserMeter };
}

export async function meReleaseMeter(card_number: string) {
  const res = await api.delete(`/api/meters/${encodeURIComponent(card_number)}`);
  return res.data as { message: string };
}

// Edit meter name
export async function meRenameMeter(card_number: string, name: string | null) {
  const res = await api.patch(`/api/meters/${encodeURIComponent(card_number)}`, { name });
  return res.data as { meter: UserMeter };
}

// ==== Admin User Detail Routes ====

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

export async function adminLinkMeterToUser(
  id: number,
  card_number: string
) {
  const res = await api.post(`/api/admin/users/${id}/link`, { card_number });
  return res.data as { message: string };
}

export async function adminRemoveUserMeter(
  id: number,
  card_number: string
) {
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

// ==== Audit Routes ====

export async function auditGetAdmins() {
  const res = await api.get(`/api/audit/admins`);
  return res.data as { admins: AdminUserRow[] };
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

// ==== Dashboard and Admin Routes ====

export async function auditGetMetrics(days = 30) {
  const res = await api.get(`/api/audit/metrics/series`, { params: { days } });
  return res.data as AuditMetrics;
}

export async function auditGetKwhPriceHistory() {
  const res = await api.get(`/api/audit/kwh-price-history`);
  return res.data as { history: KwhPriceHistoryEntry[] };
}

export async function adminUpdateKwhPrice(price: number) {
  const res = await api.post(`/api/admin/kwh-price`, { price });
  return res.data as { message: string; kwh_price: number };
}

// ==== Mock Pausa Verification ====

export async function mockPausaVerify(username: string) {
  const res = await api.post(`/api/mock/pausa/verify`, { username });
  return res.data as { message: string };
}