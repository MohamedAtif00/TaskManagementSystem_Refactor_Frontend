import { Observable } from 'rxjs';
import { HolidayFormPayload, HolidayListParams } from '../../domain/entity/holidays.entity';
import { HolidayModel } from '../model/holidays.model';
import { ListPageResponse } from '@core/models/list-page.model';

export abstract class HolidaysRemoteDataSource {
  abstract list(params: HolidayListParams): Observable<ListPageResponse<HolidayModel>>;
  abstract save(payload: HolidayFormPayload): Observable<HolidayModel>;
  abstract remove(id: number): Observable<void>;
}

export abstract class HolidaysLocalDataSource {
  abstract list(params: HolidayListParams): Observable<ListPageResponse<HolidayModel>>;
  abstract save(payload: HolidayFormPayload): Observable<HolidayModel>;
  abstract remove(id: number): Observable<void>;
}
