import { Observable } from 'rxjs';
import { DecidePayload, LeaveKind, LeaveQueueFilters, LeaveQueueItem } from '../entity/leave-calendar.entity';

export abstract class LeaveCalendarRepository {
  abstract getQueue(kind: LeaveKind, filters: LeaveQueueFilters): Observable<LeaveQueueItem[]>;
  abstract getDetails(kind: LeaveKind, id: number): Observable<LeaveQueueItem>;
  abstract decide(payload: DecidePayload): Observable<void>;
}
