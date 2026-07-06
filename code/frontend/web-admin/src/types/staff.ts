import { Role, type User } from '@/types/auth';

export type Staff = User;

export interface CreateStaffDto {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: Role;
}

export interface UpdateStaffDto {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: Role;
}

export const ROLE_LABEL: Record<Role, string> = {
  [Role.OWNER]: 'Chủ quán',
  [Role.STAFF]: 'Nhân viên',
};

export const ROLE_CLASS: Record<Role, string> = {
  [Role.OWNER]: 'bg-primary/10 text-primary',
  [Role.STAFF]: 'bg-secondary text-secondary-foreground',
};
