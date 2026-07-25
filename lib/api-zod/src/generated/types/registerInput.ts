import type { RegisterInputRole } from './registerInputRole';

export interface RegisterInput {
  /** @minLength 2 */
  name: string;
  email: string;
  /** @minLength 6 */
  password: string;
  role: RegisterInputRole;
  department?: string;
  phone?: string;
  staffId?: string;
}
