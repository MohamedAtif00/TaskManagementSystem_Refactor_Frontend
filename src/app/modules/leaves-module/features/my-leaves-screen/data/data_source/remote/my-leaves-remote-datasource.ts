import { Observable } from 'rxjs';
import {
  CancelRequestPayload,
  CreateForgotClockPayload,
  CreateLeavePayload,
  CreatePermissionPayload,
  CreateWfhPayload,
  LeaveBalanceEntity,
  LeavePreviewEntity,
  MyLeaveListParams,
} from '../../../domain/entity/my-leaves.entity';
import { ListPageResponse } from '@core/models/list-page.model';
import { MyLeaveRequestItem } from '../../../domain/entity/my-leaves.entity';

export abstract class MyLeavesRemoteDataSource {
  abstract getBalances(userId: number): Observable<LeaveBalanceEntity>;
  abstract getRequests(params: MyLeaveListParams): Observable<ListPageResponse<MyLeaveRequestItem>>;
  abstract previewLeave(payload: Pick<CreateLeavePayload, 'startDate' | 'endDate'>): Observable<LeavePreviewEntity>;
  abstract createLeave(userId: number, payload: CreateLeavePayload): Observable<void>;
  abstract createPermission(userId: number, payload: CreatePermissionPayload): Observable<void>;
  abstract createWfh(userId: number, payload: CreateWfhPayload): Observable<void>;
  abstract createForgotClock(userId: number, payload: CreateForgotClockPayload): Observable<void>;
  abstract cancel(userId: number, payload: CancelRequestPayload): Observable<void>;
}
