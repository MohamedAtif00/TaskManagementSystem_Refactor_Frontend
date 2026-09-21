import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { DashboardParams } from '../../domain/entity/dashboard-params.entity';
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

  getDashboard(params: DashboardParams): Observable<DashboardEntity> {
    if (environment.useMock) {
      return this.local.getDashboard(params).pipe(map((model) => DashboardMapper.toEntity(model)));
    }
    return this.remote.getDashboard(params).pipe(map((model) => DashboardMapper.toEntity(model)));
  }
}
