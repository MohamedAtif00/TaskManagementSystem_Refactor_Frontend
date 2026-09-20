import { Observable } from 'rxjs';
import {
  CancelRequestPayload,
  CreateLeavePayload,
  CreatePermissionPayload,
  CreateWfhPayload,
} from '../../../domain/entity/my-leaves.entity';
import { MyLeavesModel } from '../../model/my-leaves.model';

export abstract class MyLeavesRemoteDataSource {
  abstract getMine(userId: number): Observable<MyLeavesModel>;
  abstract createLeave(userId: number, payload: CreateLeavePayload): Observable<void>;
  abstract createPermission(userId: number, payload: CreatePermissionPayload): Observable<void>;
  abstract createWfh(userId: number, payload: CreateWfhPayload): Observable<void>;
  abstract cancel(userId: number, payload: CancelRequestPayload): Observable<void>;
}
