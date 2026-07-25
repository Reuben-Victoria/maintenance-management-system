import type { UserUpdateRole } from './userUpdateRole';

export interface UserUpdate {
  name?: string;
  department?: string;
  phone?: string;
  isActive?: boolean;
  role?: UserUpdateRole;
}
