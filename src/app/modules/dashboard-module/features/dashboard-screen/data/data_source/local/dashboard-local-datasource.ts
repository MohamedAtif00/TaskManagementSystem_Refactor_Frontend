import { Observable } from 'rxjs';
import { DashboardParams } from '../../../domain/entity/dashboard-params.entity';
import { DashboardModel } from '../../model/dashboard.model';

export abstract class DashboardLocalDataSource {
  abstract getDashboard(params: DashboardParams): Observable<DashboardModel>;
}
