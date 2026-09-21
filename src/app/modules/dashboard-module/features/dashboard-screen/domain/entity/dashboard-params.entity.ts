import { UserRole } from '@core/models/user-role';

export interface DashboardParams {
  role: UserRole;
  userId: number;
}
