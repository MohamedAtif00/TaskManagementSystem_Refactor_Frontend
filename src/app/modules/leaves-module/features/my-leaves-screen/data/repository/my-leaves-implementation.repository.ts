import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  CancelRequestPayload,
  CreateForgotClockPayload,
  CreateLeavePayload,
  CreatePermissionPayload,
  CreateWfhPayload,
  LeavePreviewEntity,
  MyLeavesEntity,
} from '../../domain/entity/my-leaves.entity';
import { MyLeavesRepository } from '../../domain/repository/my-leaves.repository';
import { MyLeavesLocalDataSource } from '../data_source/local/my-leaves-local-datasource';
import { MyLeavesRemoteDataSource } from '../data_source/remote/my-leaves-remote-datasource';
import { MyLeavesMapper } from '../model/my-leaves.model';

@Injectable()
export class MyLeavesImplementationRepository implements MyLeavesRepository {
  constructor(
    private local: MyLeavesLocalDataSource,
    private remote: MyLeavesRemoteDataSource,
  ) {}

  getMine(userId: number): Observable<MyLeavesEntity> {
    const source = environment.useMock ? this.local.getMine(userId) : this.remote.getMine(userId);
    return source.pipe(map((row) => MyLeavesMapper.toEntity(row)));
  }

  previewLeave(payload: Pick<CreateLeavePayload, 'startDate' | 'endDate'>): Observable<LeavePreviewEntity> {
    return environment.useMock ? this.local.previewLeave(payload) : this.remote.previewLeave(payload);
  }

  createLeave(userId: number, payload: CreateLeavePayload): Observable<void> {
    return environment.useMock
      ? this.local.createLeave(userId, payload)
      : this.remote.createLeave(userId, payload);
  }

  createPermission(userId: number, payload: CreatePermissionPayload): Observable<void> {
    return environment.useMock
      ? this.local.createPermission(userId, payload)
      : this.remote.createPermission(userId, payload);
  }

  createWfh(userId: number, payload: CreateWfhPayload): Observable<void> {
    return environment.useMock
      ? this.local.createWfh(userId, payload)
      : this.remote.createWfh(userId, payload);
  }

  createForgotClock(userId: number, payload: CreateForgotClockPayload): Observable<void> {
    return environment.useMock
      ? this.local.createForgotClock(userId, payload)
      : this.remote.createForgotClock(userId, payload);
  }

  cancel(userId: number, payload: CancelRequestPayload): Observable<void> {
    return environment.useMock ? this.local.cancel(userId, payload) : this.remote.cancel(userId, payload);
  }
}
