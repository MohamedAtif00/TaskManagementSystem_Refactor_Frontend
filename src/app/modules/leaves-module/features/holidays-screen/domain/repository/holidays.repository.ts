import { Observable } from 'rxjs';
import { HolidayEntity, HolidayFormPayload } from '../entity/holidays.entity';

export abstract class HolidaysRepository {
  abstract list(): Observable<HolidayEntity[]>;
  abstract save(payload: HolidayFormPayload): Observable<HolidayEntity>;
  abstract remove(id: number): Observable<void>;
}
