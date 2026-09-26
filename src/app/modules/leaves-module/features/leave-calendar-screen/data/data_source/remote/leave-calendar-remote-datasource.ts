import { Observable } from 'rxjs';
import { ListPageResponse } from '@core/models/list-page.model';
import {
  BulkDecidePayload,
  BulkOpinionResult,
  DecidePayload,
  LeaveKind,
  LeaveQueueFilters,
} from '../../../domain/entity/leave-calendar.entity';
import { LeaveQueueModel } from '../../model/leave-calendar.model';

export abstract class LeaveCalendarRemoteDataSource {
  abstract getQueue(kind: LeaveKind, filters: LeaveQueueFilters): Observable<ListPageResponse<LeaveQueueModel>>;
  abstract getDetails(kind: LeaveKind, id: number): Observable<LeaveQueueModel>;
  abstract decide(payload: DecidePayload): Observable<void>;
  abstract bulkDecide(payload: BulkDecidePayload): Observable<BulkOpinionResult>;
}
