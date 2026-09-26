import { Observable } from 'rxjs';
import {
  BulkDecidePayload,
  BulkOpinionResult,
  DecidePayload,
  LeaveKind,
  LeaveQueueFilters,
  LeaveQueueItem,
  LeaveQueuePage,
} from '../entity/leave-calendar.entity';

export abstract class LeaveCalendarRepository {
  abstract getQueue(kind: LeaveKind, filters: LeaveQueueFilters): Observable<LeaveQueuePage>;
  abstract getDetails(kind: LeaveKind, id: number): Observable<LeaveQueueItem>;
  abstract decide(payload: DecidePayload): Observable<void>;
  abstract bulkDecide(payload: BulkDecidePayload): Observable<BulkOpinionResult>;
}
