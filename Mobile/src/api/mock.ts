// Mock API for testing
import { request } from './request';

export async function mockPausaVerify(username: string) {
  return request(`/api/mock/pausa/verify`, {
    method: 'POST',
    body: JSON.stringify({ username }),
  }) as Promise<{ message: string }>;
}