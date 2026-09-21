import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_PUBLIC_HOLIDAYS } from '@core/hr/mock-holidays';
import { HolidayFormPayload } from '../../../domain/entity/holidays.entity';
import { HolidayModel } from '../../model/holidays.model';
import { HolidaysLocalDataSource } from '../holidays.datasource';

@Injectable()
export class HolidaysLocalDataSourceImpl extends HolidaysLocalDataSource {
  private rows: HolidayModel[] = MOCK_PUBLIC_HOLIDAYS;

  list(): Observable<HolidayModel[]> {
    return of(this.rows.map((row) => ({ ...row }))).pipe(delay(80));
  }

  save(payload: HolidayFormPayload): Observable<HolidayModel> {
    if (payload.endDate < payload.startDate) {
      return throwError(() => new Error('End date must be after start date'));
    }
    if (payload.id) {
      const index = this.rows.findIndex((row) => row.id === payload.id);
      if (index < 0) {
        return throwError(() => new Error('Holiday not found'));
      }
      this.rows[index] = { ...this.rows[index], ...payload, id: payload.id };
      return of({ ...this.rows[index] }).pipe(delay(80));
    }
    const created: HolidayModel = {
      id: Math.max(0, ...this.rows.map((row) => row.id)) + 1,
      name: payload.name,
      description: payload.description,
      startDate: payload.startDate,
      endDate: payload.endDate,
    };
    this.rows.push(created);
    return of({ ...created }).pipe(delay(80));
  }

  remove(id: number): Observable<void> {
    const index = this.rows.findIndex((row) => row.id === id);
    if (index >= 0) {
      this.rows.splice(index, 1);
    }
    return of(undefined).pipe(delay(40));
  }
}
