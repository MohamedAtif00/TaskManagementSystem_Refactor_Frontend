import { Observable } from 'rxjs';
import { DecidePayload, LeaveKind, LeaveQueueFilters } from '../../../domain/entity/leave-calendar.entity';
import { LeaveQueueModel } from '../../model/leave-calendar.model';

export abstract class LeaveCalendarRemoteDataSource {
  abstract getQueue(kind: LeaveKind, filters: LeaveQueueFilters): Observable<LeaveQueueModel[]>;
  abstract getDetails(kind: LeaveKind, id: number): Observable<LeaveQueueModel>;
  abstract decide(payload: DecidePayload): Observable<void>;
}
