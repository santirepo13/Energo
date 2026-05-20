// Shared types used across multiple API modules

// User profile data from user_profiles table
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

// Meter/card data
export type UserMeter = {
  card_number: string;
  name?: string | null;
  current_balance: number;
  current_kwh: number;
  last_recharge: string | null;
};

// Recharge history entry
export type RechargeHistoryEntry = {
  user_id?: number;
  email?: string | null;
  pin_code: string;
  amount: number;
  kwh: number;
  kwh_price_at_time?: number | null;
  created_at: string;
  card_number: string;
};

// Meter/card with balance info
export type CardInfo = {
  card_number: string;
  name?: string | null;
  current_balance: number;
  current_kwh: number;
};

// Security log entry
export type SecurityLogEntry = {
  event_type: string;
  event_time: string;
  ip_address: string;
  details: string;
};

// Admin user row (for lists)
export type AdminUserRow = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  last_login: string | null;
  role: string | null;
  status: string | null;
};

// Audit metrics
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

// KWH price history entry
export type KwhPriceHistoryEntry = {
  id: number;
  admin_user_id: number;
  admin_username: string | null;
  price_cop: number;
  created_at: string;
};

// Employee code row
export type EmployeeCodeRow = {
  id: number;
  code: string;
  role: string | null;
  used: number | boolean;
  created_at: string;
  used_at: string | null;
  used_by_username?: string | null;
};