import { Observable } from 'rxjs';
import { UserDetailModel, UserFormOptionsModel, UserListItemModel } from '../../model/user-list.model';
import { UserFormPayload, UserListParams } from '../../../domain/entity/user-list.entity';

export abstract class UserListLocalDataSource {
  abstract getUsers(params: UserListParams): Observable<UserListItemModel[]>;
  abstract getUser(id: number): Observable<UserDetailModel>;
  abstract saveUser(payload: UserFormPayload): Observable<UserDetailModel>;
  abstract archiveUser(id: number): Observable<void>;
  abstract getFormOptions(): Observable<UserFormOptionsModel>;
}
