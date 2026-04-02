console.log('Cargando modelo de tarjeta de energía');

export interface EnergyCard {
  id: number;
  user_id: number | null;
  card_number: string;
  name: string | null;
  current_balance: number;
  current_kwh: number;
  last_recharge: Date | null;
  released: boolean;
  released_by_user_id: number | null;
  released_at: Date | null;
}

export interface EnergyCardWithUser extends EnergyCard {
  username: string;
  email: string;
}