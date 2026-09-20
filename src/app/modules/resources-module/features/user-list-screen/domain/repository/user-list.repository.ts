import { Observable } from 'rxjs';
import { UserDetailEntity, UserFormOptions, UserFormPayload, UserListItemEntity, UserListParams } from '../entity/user-list.entity';

export abstract class UserListRepository {
  abstract getUsers(params: UserListParams): Observable<UserListItemEntity[]>;
  abstract getUser(id: number): Observable<UserDetailEntity>;
  abstract saveUser(payload: UserFormPayload): Observable<UserDetailEntity>;
  abstract archiveUser(id: number): Observable<void>;
  abstract getFormOptions(): Observable<UserFormOptions>;
}
