import { Observable } from 'rxjs';
import { ListPageResponse } from '@core/models/list-page.model';
import {
  CancelRequestPayload,
  CreateForgotClockPayload,
  CreateLeavePayload,
  CreatePermissionPayload,
  CreateWfhPayload,
  LeaveBalanceEntity,
  LeavePreviewEntity,
  MyLeaveListParams,
  MyLeaveRequestItem,
} from '../../../domain/entity/my-leaves.entity';

export abstract class MyLeavesLocalDataSource {
  abstract getBalances(userId: number): Observable<LeaveBalanceEntity>;
  abstract getRequests(params: MyLeaveListParams): Observable<ListPageResponse<MyLeaveRequestItem>>;
  abstract previewLeave(payload: Pick<CreateLeavePayload, 'startDate' | 'endDate'>): Observable<LeavePreviewEntity>;
  abstract createLeave(userId: number, payload: CreateLeavePayload): Observable<void>;
  abstract createPermission(userId: number, payload: CreatePermissionPayload): Observable<void>;
  abstract createWfh(userId: number, payload: CreateWfhPayload): Observable<void>;
  abstract createForgotClock(userId: number, payload: CreateForgotClockPayload): Observable<void>;
  abstract cancel(userId: number, payload: CancelRequestPayload): Observable<void>;
}
