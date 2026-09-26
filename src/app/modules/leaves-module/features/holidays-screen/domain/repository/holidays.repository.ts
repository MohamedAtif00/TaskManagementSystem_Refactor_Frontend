import { Observable } from 'rxjs';
import { HolidayEntity, HolidayFormPayload, HolidayListPage, HolidayListParams } from '../entity/holidays.entity';

export abstract class HolidaysRepository {
  abstract list(params: HolidayListParams): Observable<HolidayListPage>;
  abstract save(payload: HolidayFormPayload): Observable<HolidayEntity>;
  abstract remove(id: number): Observable<void>;
}
