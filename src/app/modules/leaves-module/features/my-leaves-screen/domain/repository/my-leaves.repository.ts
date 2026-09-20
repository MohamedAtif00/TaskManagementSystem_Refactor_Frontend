import { Observable } from 'rxjs';
import {
  CancelRequestPayload,
  CreateLeavePayload,
  CreatePermissionPayload,
  CreateWfhPayload,
  MyLeavesEntity,
} from '../entity/my-leaves.entity';

export abstract class MyLeavesRepository {
  abstract getMine(userId: number): Observable<MyLeavesEntity>;
  abstract createLeave(userId: number, payload: CreateLeavePayload): Observable<void>;
  abstract createPermission(userId: number, payload: CreatePermissionPayload): Observable<void>;
  abstract createWfh(userId: number, payload: CreateWfhPayload): Observable<void>;
  abstract cancel(userId: number, payload: CancelRequestPayload): Observable<void>;
}
