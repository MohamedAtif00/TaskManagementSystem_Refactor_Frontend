import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CreateForgotClockForm, ForgotClockEntity } from '../../../domain/entity/forgot-clock.entity';
import { ForgotClockLocalDataSource } from '../forgot-clock.datasource';

@Injectable()
export class ForgotClockLocalDataSourceImpl extends ForgotClockLocalDataSource {
  private rows: ForgotClockEntity[] = [];
  private nextId = 1;

  listMine(): Observable<ForgotClockEntity[]> {
    return of(this.rows.map((row) => ({ ...row }))).pipe(delay(80));
  }

  create(payload: CreateForgotClockForm): Observable<void> {
    this.rows = [
      ...this.rows,
      {
        id: this.nextId++,
        punchType: payload.punchType,
        attendanceDate: payload.attendanceDate,
        intendedTime: payload.intendedTime,
        reason: payload.reason,
        status: 'Pending',
      },
    ];
    return of(undefined).pipe(delay(80));
  }

  cancel(id: number): Observable<void> {
    this.rows = this.rows.map((row) => (row.id === id ? { ...row, status: 'Cancelled' } : row));
    return of(undefined).pipe(delay(40));
  }
}
