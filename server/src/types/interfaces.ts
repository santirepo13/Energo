console.log('Cargando interfaces de tipos');

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role_id: number;
  status_id: number;
  created_at: Date;
  last_login: Date | null;
}

export interface UserProfile {
  user_id: number;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  tipo_identificacion: string;
  numero_identificacion: string;
  direccion: string | null;
  telefono: string | null;
}

export interface UserWithDetails extends User {
  role_name: string;
  status_name: string;
}

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

export interface RechargePin {
  id: number;
  user_id: number;
  card_number: string;
  pin_code: string;
  amount: number;
  kwh: number;
  created_at: Date;
}

export interface RechargeTransaction {
  id: number;
  user_id: number;
  card_number: string;
  amount: number;
  kwh: number;
  created_at: Date;
}

export interface EmployeeCode {
  id: number;
  code: string;
  role_id: number;
  used: boolean;
  used_at: Date | null;
  created_at: Date;
}

export interface EmployeeCodeUsage {
  id: number;
  employee_code_id: number;
  user_id: number;
  used_at: Date;
}

export interface UserFlag {
  user_id: number;
  personal_data_filled: boolean;
  filled_at: Date | null;
}

export interface EmployeeCodeWithDetails {
  id: number;
  code: string;
  used: number | boolean;
  created_at: string;
  used_at: string | null;
  role: string | null;
  used_by_username: string | null;
}

export interface IEnergyCardRepository {
  findByCardNumber: (cardNumber: string) => Promise<EnergyCard | null>;
  findByUserId: (userId: number) => Promise<EnergyCard[]>;
  findByUserIdAndCardNumber: (userId: number, cardNumber: string) => Promise<EnergyCard | null>;
  create: (userId: number, cardNumber: string, name: string | null) => Promise<void>;
  updateBalance: (userId: number, cardNumber: string, balance: number, kwh: number) => Promise<void>;
  updateName: (userId: number, cardNumber: string, name: string | null) => Promise<void>;
  release: (userId: number, cardNumber: string, releasedByUserId: number | null) => Promise<void>;
  claimReleased: (cardId: number, userId: number, name: string | null) => Promise<void>;
  transferOwnership: (cardId: number, newUserId: number) => Promise<void>;
}