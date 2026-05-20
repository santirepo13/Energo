import { api } from './instance';

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

export async function login(data: LoginRequest) {
  const res = await api.post('/api/auth/login', data);
  return res.data as { message: string };
}

export async function registerUser(data: RegisterRequest) {
  const res = await api.post('/api/auth/register', data);
  return res.data as { message: string } | { error: string };
}
