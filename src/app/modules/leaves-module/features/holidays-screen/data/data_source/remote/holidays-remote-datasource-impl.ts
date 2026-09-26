import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HolidayResponse } from '@core/api/tms-contracts';
import { ListPageResponse } from '@core/models/list-page.model';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { HolidayFormPayload, HolidayListParams } from '../../../domain/entity/holidays.entity';
import { HolidayModel } from '../../model/holidays.model';
import { HolidaysRemoteDataSource } from '../holidays.datasource';

@Injectable()
export class HolidaysRemoteDataSourceImpl extends HolidaysRemoteDataSource {
  constructor(private network: NetworkService) {
    super();
  }

  list(params: HolidayListParams): Observable<ListPageResponse<HolidayModel>> {
    const httpParams = new HttpParams({
      fromObject: {
        page: String(params.page),
        pageSize: String(params.pageSize),
      },
    });
    return this.network.get<ListPageResponse<HolidayResponse>>(API.Holidays.List, httpParams).pipe(
      map((page) => ({
        items: page.items.map((row) => this.toModel(row)),
        page: page.page,
        pageSize: page.pageSize,
        totalCount: page.totalCount,
      })),
      catchError(mapHttpError),
    );
  }

  save(payload: HolidayFormPayload): Observable<HolidayModel> {
    const body = {
      name: payload.name,
      description: payload.description || null,
      startDate: payload.startDate,
      endDate: payload.endDate,
    };
    const request$ = payload.id
      ? this.network.put<HolidayResponse>(apiPath(API.Holidays.Update, { id: payload.id }), body)
      : this.network.post<HolidayResponse>(API.Holidays.Create, body);
    return request$.pipe(
      map((row) => this.toModel(row)),
      catchError(mapHttpError),
    );
  }

  remove(id: number): Observable<void> {
    return this.network.delete(apiPath(API.Holidays.Delete, { id })).pipe(
      map(() => undefined),
      catchError(mapHttpError),
    );
  }

  private toModel(row: HolidayResponse): HolidayModel {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      startDate: String(row.startDate).slice(0, 10),
      endDate: String(row.endDate).slice(0, 10),
    };
  }
}
