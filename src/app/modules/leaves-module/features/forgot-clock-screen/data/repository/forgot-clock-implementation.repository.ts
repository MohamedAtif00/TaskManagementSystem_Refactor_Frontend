import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { CreateForgotClockForm, ForgotClockEntity } from '../../domain/entity/forgot-clock.entity';
import { ForgotClockRepository } from '../../domain/repository/forgot-clock.repository';
import { ForgotClockLocalDataSource, ForgotClockRemoteDataSource } from '../data_source/forgot-clock.datasource';

@Injectable()
export class ForgotClockImplementationRepository implements ForgotClockRepository {
  constructor(
    private local: ForgotClockLocalDataSource,
    private remote: ForgotClockRemoteDataSource,
  ) {}

  listMine(): Observable<ForgotClockEntity[]> {
    return environment.useMock ? this.local.listMine() : this.remote.listMine();
  }

  create(payload: CreateForgotClockForm): Observable<void> {
    return environment.useMock ? this.local.create(payload) : this.remote.create(payload);
  }

  cancel(id: number): Observable<void> {
    return environment.useMock ? this.local.cancel(id) : this.remote.cancel(id);
  }
}
