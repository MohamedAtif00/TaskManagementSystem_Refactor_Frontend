import { Observable } from 'rxjs';
import { HolidayEntity, HolidayFormPayload } from '../entity/holiday-list.entity';

export abstract class HolidayListRepository {
  abstract list(): Observable<HolidayEntity[]>;
  abstract save(payload: HolidayFormPayload): Observable<HolidayEntity>;
  abstract remove(id: number): Observable<void>;
}
