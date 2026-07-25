import type { UserRole } from './userRole';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  /** @nullable */
  department?: string | null;
  /** @nullable */
  phone?: string | null;
  /** @nullable */
  staffId?: string | null;
  isActive: boolean;
  createdAt: Date;
}
