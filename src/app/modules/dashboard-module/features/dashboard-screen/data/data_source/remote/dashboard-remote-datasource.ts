import { Observable } from 'rxjs';
import { UserRole } from '@core/models/user-role';
import { DashboardModel } from '../../model/dashboard.model';

export abstract class DashboardRemoteDataSource {
  abstract getDashboard(role: UserRole): Observable<DashboardModel>;
}
