import { UserRole } from './user-role';

export interface AuthUser {
  id: number;
  name: string;
  code: string;
  role: UserRole;
  group: string;
  token: string;
  permissions: string[];
  notifications: number;
}
