import { api } from './instance';

export type UserProfile = {
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  tipo_identificacion: string;
  numero_identificacion: string;
  direccion: string | null;
  telefono: string | null;
};

export type MeProfileResponse = {
  username: string;
  email: string;
  profile: UserProfile | null;
  personal_data_filled?: boolean;
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

export async function meGetProfile() {
  const res = await api.get('/api/user/profile');
  return res.data as MeProfileResponse;
}

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

export async function meChangePassword(current_password: string, new_password: string) {
  const res = await api.post('/api/user/password-change', { current_password, new_password });
  return res.data as { message: string };
}

export type SelfStatus = 'Pausa' | 'Deshabilitado';

export async function meUpdateStatus(status: SelfStatus) {
  const res = await api.post('/api/user/status', { status });
  return res.data as { message: string };
}
