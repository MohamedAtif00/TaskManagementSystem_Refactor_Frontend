import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  UserDetailEntity,
  UserFormOptions,
  UserFormPayload,
  UserListPageEntity,
  UserListParams,
} from '../../domain/entity/user-list.entity';
import { UserListRepository } from '../../domain/repository/user-list.repository';
import { UserListLocalDataSource } from '../data_source/local/user-list-local-datasource';
import { UserListRemoteDataSource } from '../data_source/remote/user-list-remote-datasource';
import { UserListMapper } from '../model/user-list.model';

@Injectable()
export class UserListImplementationRepository implements UserListRepository {
  constructor(
    private local: UserListLocalDataSource,
    private remote: UserListRemoteDataSource,
  ) {}

  getUsers(params: UserListParams): Observable<UserListPageEntity> {
    const source = environment.useMock ? this.local.getUsers(params) : this.remote.getUsers(params);
    return source.pipe(
      map((page) => ({
        ...page,
        items: page.items.map((row) => UserListMapper.toEntity(row)),
      })),
    );
  }

  getUser(id: number): Observable<UserDetailEntity> {
    const source = environment.useMock ? this.local.getUser(id) : this.remote.getUser(id);
    return source.pipe(map((row) => UserListMapper.toDetail(row)));
  }

  saveUser(payload: UserFormPayload): Observable<UserDetailEntity> {
    const source = environment.useMock ? this.local.saveUser(payload) : this.remote.saveUser(payload);
    return source.pipe(map((row) => UserListMapper.toDetail(row)));
  }

  archiveUser(id: number): Observable<void> {
    return environment.useMock ? this.local.archiveUser(id) : this.remote.archiveUser(id);
  }

  getFormOptions(): Observable<UserFormOptions> {
    const source = environment.useMock ? this.local.getFormOptions() : this.remote.getFormOptions();
    return source.pipe(map((row) => UserListMapper.toFormOptions(row)));
  }
}
