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

export interface UserWithDetails extends User {
  role_name: string;
  status_name: string;
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


export interface UserFlag {
  user_id: number;
  personal_data_filled: boolean;
  filled_at: Date | null;
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