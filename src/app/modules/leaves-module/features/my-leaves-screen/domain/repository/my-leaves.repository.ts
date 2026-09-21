import { Observable } from 'rxjs';
import {
  CancelRequestPayload,
  CreateForgotClockPayload,
  CreateLeavePayload,
  CreatePermissionPayload,
  CreateWfhPayload,
  LeavePreviewEntity,
  MyLeavesEntity,
} from '../entity/my-leaves.entity';

export abstract class MyLeavesRepository {
  abstract getMine(userId: number): Observable<MyLeavesEntity>;
  abstract previewLeave(payload: Pick<CreateLeavePayload, 'startDate' | 'endDate'>): Observable<LeavePreviewEntity>;
  abstract createLeave(userId: number, payload: CreateLeavePayload): Observable<void>;
  abstract createPermission(userId: number, payload: CreatePermissionPayload): Observable<void>;
  abstract createWfh(userId: number, payload: CreateWfhPayload): Observable<void>;
  abstract createForgotClock(userId: number, payload: CreateForgotClockPayload): Observable<void>;
  abstract cancel(userId: number, payload: CancelRequestPayload): Observable<void>;
}
