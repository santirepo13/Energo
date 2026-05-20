// Profile and self-service API
import { request } from './request';
import { UserProfile, CardInfo, RechargeHistoryEntry } from './shared-types';

// Response from GET /me/profile
export type MeProfileResponse = {
  username: string;
  email: string;
  profile: UserProfile | null;
  personal_data_filled?: boolean;
  cards?: Array<CardInfo>;
  recharge_history?: Array<RechargeHistoryEntry>;
};

// Update profile request
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

// Self account status
export type SelfStatus = 'Pausa' | 'Deshabilitado';

// Get own profile
export async function meGetProfile() {
  return request('/api/user/profile') as Promise<MeProfileResponse>;
}

// Create/update own profile
export async function meUpdateProfile(data: UpdateProfileRequest) {
  return request('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }) as Promise<{ message: string }>;
}

// Change password (validates policy on backend)
export async function meChangePassword(current_password: string, new_password: string) {
  return request('/api/user/password-change', {
    method: 'POST',
    body: JSON.stringify({ current_password, new_password }),
  }) as Promise<{ message: string }>;
}

// Update account status (Pausa or Deshabilitado)
export async function meUpdateStatus(status: SelfStatus) {
  return request('/api/user/status', {
    method: 'POST',
    body: JSON.stringify({ status }),
  }) as Promise<{ message: string }>;
}