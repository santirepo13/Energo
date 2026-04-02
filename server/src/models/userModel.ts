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
