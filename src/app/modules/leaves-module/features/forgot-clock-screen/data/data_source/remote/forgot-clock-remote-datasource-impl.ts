import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ForgotClockRequestResponse } from '@core/api/tms-contracts';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { CreateForgotClockForm, ForgotClockEntity, ForgotClockPunchType, ForgotClockStatus } from '../../../domain/entity/forgot-clock.entity';
import { ForgotClockRemoteDataSource } from '../forgot-clock.datasource';

@Injectable()
export class ForgotClockRemoteDataSourceImpl extends ForgotClockRemoteDataSource {
  constructor(private network: NetworkService) {
    super();
  }

  listMine(): Observable<ForgotClockEntity[]> {
    return this.network.get<ForgotClockRequestResponse[]>(API.ForgotClock.List).pipe(
      map((rows) => rows.map((row) => this.toEntity(row))),
      catchError(mapHttpError),
    );
  }

  create(payload: CreateForgotClockForm): Observable<void> {
    return this.network.post(API.ForgotClock.List, payload).pipe(
      map(() => undefined),
      catchError(mapHttpError),
    );
  }

  cancel(id: number): Observable<void> {
    return this.network.put(apiPath(API.ForgotClock.Cancel, { id }), {}).pipe(
      map(() => undefined),
      catchError(mapHttpError),
    );
  }

  private toEntity(row: ForgotClockRequestResponse): ForgotClockEntity {
    return {
      id: row.id,
      punchType: row.punchType as ForgotClockPunchType,
      attendanceDate: String(row.attendanceDate).slice(0, 10),
      intendedTime: row.intendedTime,
      reason: row.reason ?? undefined,
      status: row.status as ForgotClockStatus,
    };
  }
}
