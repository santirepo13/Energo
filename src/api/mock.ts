import { api } from './instance';

export async function mockPausaVerify(username: string) {
  const res = await api.post(`/api/mock/pausa/verify`, { username });
  return res.data as { message: string };
}
