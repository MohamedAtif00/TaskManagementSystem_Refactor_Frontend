import { Observable } from 'rxjs';
import { DashboardParams } from '../entity/dashboard-params.entity';
import { DashboardEntity } from '../entity/dashboard.entity';

export abstract class DashboardRepository {
  abstract getDashboard(params: DashboardParams): Observable<DashboardEntity>;
}
