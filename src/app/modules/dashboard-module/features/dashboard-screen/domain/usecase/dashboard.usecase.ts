import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { UserRole } from '@core/models/user-role';
import { DashboardEntity } from '../entity/dashboard.entity';
import { DashboardRepository } from '../repository/dashboard.repository';

@Injectable()
export class DashboardUseCase implements BaseUseCase<UserRole, DashboardEntity> {
  constructor(private repository: DashboardRepository) {}

  execute(role: UserRole): Observable<DashboardEntity> {
    return this.repository.getDashboard(role);
  }
}
