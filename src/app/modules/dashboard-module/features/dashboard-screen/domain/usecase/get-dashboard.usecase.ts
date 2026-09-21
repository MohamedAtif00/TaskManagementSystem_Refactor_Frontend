import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { DashboardParams } from '../entity/dashboard-params.entity';
import { DashboardEntity } from '../entity/dashboard.entity';
import { DashboardRepository } from '../repository/dashboard.repository';

@Injectable()
export class GetDashboardUseCase implements BaseUseCase<DashboardParams, DashboardEntity> {
  constructor(private repository: DashboardRepository) {}

  execute(params: DashboardParams): Observable<DashboardEntity> {
    return this.repository.getDashboard(params);
  }
}
