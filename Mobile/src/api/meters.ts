// Meters (cards) API
import { request } from './request';
import { UserMeter } from './shared-types';

export async function meListMeters() {
  return request('/api/meters') as Promise<{ meters: UserMeter[] }>;
}

export async function meAddMeter(card_number: string, name?: string) {
  const body: any = { card_number };
  if (name && name.trim()) body.name = name.trim();
  return request('/api/meters', {
    method: 'POST',
    body: JSON.stringify(body),
  }) as Promise<{ meter: UserMeter }>;
}

export async function meReleaseMeter(card_number: string) {
  return request(`/api/meters/${encodeURIComponent(card_number)}`, {
    method: 'DELETE',
  }) as Promise<{ message: string }>;
}

// Edit meter name
export async function meRenameMeter(card_number: string, name: string | null) {
  return request(`/api/meters/${encodeURIComponent(card_number)}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  }) as Promise<{ meter: UserMeter }>;
}