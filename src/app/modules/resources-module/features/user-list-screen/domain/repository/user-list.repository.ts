import { Observable } from 'rxjs';
import {
  UserBalanceEntity,
  UserBalanceUpdate,
  UserDetailEntity,
  UserFormOptions,
  UserFormPayload,
  UserListPageEntity,
  UserListParams,
} from '../entity/user-list.entity';

export abstract class UserListRepository {
  abstract getUsers(params: UserListParams): Observable<UserListPageEntity>;
  abstract getUser(id: number): Observable<UserDetailEntity>;
  abstract getUserBalance(id: number): Observable<UserBalanceEntity>;
  abstract saveUserBalance(payload: UserBalanceUpdate): Observable<UserBalanceEntity>;
  abstract saveUser(payload: UserFormPayload): Observable<UserDetailEntity>;
  abstract archiveUser(id: number): Observable<void>;
  abstract getFormOptions(): Observable<UserFormOptions>;
}
