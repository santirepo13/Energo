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