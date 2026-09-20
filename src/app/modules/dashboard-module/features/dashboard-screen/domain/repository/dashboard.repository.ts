import { Observable } from 'rxjs';
import { UserRole } from '@core/models/user-role';
import { DashboardEntity } from '../entity/dashboard.entity';

export abstract class DashboardRepository {
  abstract getDashboard(role: UserRole): Observable<DashboardEntity>;
}
