// EnergoMobile - HTTP request function
// This file contains only the request function, avoiding circular dependencies
export const API_BASE_URL = 'https://energoapi.gosr.lol';

export async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // No token for cookie-based auth

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // For cookie-based auth
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw error;
    }

    return response.json();
  } catch (err: any) {
    // Network errors in React Native appear as TypeError
    if (err instanceof TypeError && err.message.includes('Network')) {
      throw { error: 'Network error', message: 'Unable to connect to server' };
    }
    throw err;
  }
}