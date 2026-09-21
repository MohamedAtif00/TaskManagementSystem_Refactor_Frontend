import { Observable } from 'rxjs';
import { BulkDecidePayload, DecidePayload, LeaveKind, LeaveQueueFilters } from '../../../domain/entity/leave-calendar.entity';
import { LeaveQueueModel } from '../../model/leave-calendar.model';

export abstract class LeaveCalendarLocalDataSource {
  abstract getQueue(kind: LeaveKind, filters: LeaveQueueFilters): Observable<LeaveQueueModel[]>;
  abstract getDetails(kind: LeaveKind, id: number): Observable<LeaveQueueModel>;
  abstract decide(payload: DecidePayload): Observable<void>;
  abstract bulkDecide(payload: BulkDecidePayload): Observable<void>;
}
