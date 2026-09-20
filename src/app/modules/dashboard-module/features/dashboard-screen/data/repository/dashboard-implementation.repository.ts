import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { UserRole } from '@core/models/user-role';
import { DashboardEntity } from '../../domain/entity/dashboard.entity';
import { DashboardRepository } from '../../domain/repository/dashboard.repository';
import { DashboardLocalDataSource } from '../data_source/local/dashboard-local-datasource';
import { DashboardRemoteDataSource } from '../data_source/remote/dashboard-remote-datasource';
import { DashboardMapper } from '../model/dashboard.model';

@Injectable()
export class DashboardImplementationRepository implements DashboardRepository {
  constructor(
    private local: DashboardLocalDataSource,
    private remote: DashboardRemoteDataSource,
  ) {}

  getDashboard(role: UserRole): Observable<DashboardEntity> {
    if (environment.useMock) {
      return this.local.getDashboard(role).pipe(map((model) => DashboardMapper.toEntity(model)));
    }
    return this.remote.getDashboard(role).pipe(map((model) => DashboardMapper.toEntity(model)));
  }
}
