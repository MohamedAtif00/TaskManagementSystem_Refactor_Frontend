import { UserRole } from '@core/models/user-role';

export interface SignInModel {
  id: number;
  name: string;
  code: string;
  role: UserRole;
  group: string;
  token: string;
  permissions: string[];
  notifications: number;
}
