import { api } from './instance';

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

export async function meRenameMeter(card_number: string, name: string | null) {
  const res = await api.patch(`/api/meters/${encodeURIComponent(card_number)}`, { name });
  return res.data as { meter: UserMeter };
}
