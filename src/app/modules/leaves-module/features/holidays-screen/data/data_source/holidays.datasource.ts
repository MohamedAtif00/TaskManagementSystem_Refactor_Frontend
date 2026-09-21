import { Observable } from 'rxjs';
import { HolidayFormPayload } from '../../domain/entity/holidays.entity';
import { HolidayModel } from '../model/holidays.model';

export abstract class HolidaysRemoteDataSource {
  abstract list(): Observable<HolidayModel[]>;
  abstract save(payload: HolidayFormPayload): Observable<HolidayModel>;
  abstract remove(id: number): Observable<void>;
}

export abstract class HolidaysLocalDataSource {
  abstract list(): Observable<HolidayModel[]>;
  abstract save(payload: HolidayFormPayload): Observable<HolidayModel>;
  abstract remove(id: number): Observable<void>;
}
