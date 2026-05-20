// Authentication API
import { request } from './request';

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
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }) as Promise<{ message: string }>;
}

export async function registerUser(data: RegisterRequest) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }) as Promise<{ message: string } | { error: string }>;
}

export async function validatePasswordReset(token: string) {
  return request(`/api/auth/password/reset/validate?token=${encodeURIComponent(token)}`) as Promise<{ username: string }>;
}

export async function resetPassword(token: string, password: string) {
  return request('/api/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  }) as Promise<{ message: string }>;
}