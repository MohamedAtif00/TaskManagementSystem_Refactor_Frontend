import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TmsMockStore } from '@core/mock/tms-mock.store';
import {
  CancelRequestPayload,
  CreateLeavePayload,
  CreatePermissionPayload,
  CreateWfhPayload,
} from '../../../domain/entity/my-leaves.entity';
import { MyLeavesModel } from '../../model/my-leaves.model';
import { MyLeavesLocalDataSource } from './my-leaves-local-datasource';

@Injectable()
export class MyLeavesLocalDataSourceImpl extends MyLeavesLocalDataSource {
  constructor(private store: TmsMockStore) {
    super();
  }

  getMine(userId: number): Observable<MyLeavesModel> {
    const user = this.store.getUser(userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }
    const filters = { userId };
    return of({
      balances: user.balances,
      leaves: this.store.listLeaves(filters),
      permissions: this.store.listPermissions(filters),
      wfh: this.store.listWfh(filters),
    }).pipe(delay(120));
  }

  createLeave(userId: number, payload: CreateLeavePayload): Observable<void> {
    if (payload.endDate < payload.startDate) {
      return throwError(() => new Error('End date must be after start date'));
    }
    this.store.createLeave({ userId, ...payload });
    return of(undefined).pipe(delay(80));
  }

  createPermission(userId: number, payload: CreatePermissionPayload): Observable<void> {
    if (payload.toTime <= payload.fromTime) {
      return throwError(() => new Error('End time must be after start time'));
    }
    this.store.createPermission({ userId, ...payload });
    return of(undefined).pipe(delay(80));
  }

  createWfh(userId: number, payload: CreateWfhPayload): Observable<void> {
    this.store.createWfh({ userId, ...payload });
    return of(undefined).pipe(delay(80));
  }

  cancel(userId: number, payload: CancelRequestPayload): Observable<void> {
    try {
      if (payload.kind === 'leave') {
        this.store.cancelLeave(payload.id);
      } else if (payload.kind === 'permission') {
        this.store.cancelPermission(payload.id);
      } else {
        this.store.cancelWfh(payload.id);
      }
      return of(undefined).pipe(delay(80));
    } catch (err) {
      return throwError(() => err);
    }
  }
}
