import { Observable } from 'rxjs';
import { HolidayFormPayload } from '../../../domain/entity/holiday-list.entity';
import { HolidayModel } from '../../model/holiday-list.model';

export abstract class HolidayListLocalDataSource {
  abstract list(): Observable<HolidayModel[]>;
  abstract save(payload: HolidayFormPayload): Observable<HolidayModel>;
  abstract remove(id: number): Observable<void>;
}
