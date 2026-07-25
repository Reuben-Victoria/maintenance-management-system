import type { User } from './user';

export interface UserList {
  data: User[];
  total: number;
  page: number;
  limit: number;
}
