import { Observable } from 'rxjs';
import { ListPageResponse } from '@core/models/list-page.model';
import { UserDetailModel, UserFormOptionsModel, UserListItemModel } from '../../model/user-list.model';
import { UserFormPayload, UserListParams } from '../../../domain/entity/user-list.entity';

export abstract class UserListLocalDataSource {
  abstract getUsers(params: UserListParams): Observable<ListPageResponse<UserListItemModel>>;
  abstract getUser(id: number): Observable<UserDetailModel>;
  abstract saveUser(payload: UserFormPayload): Observable<UserDetailModel>;
  abstract archiveUser(id: number): Observable<void>;
  abstract getFormOptions(): Observable<UserFormOptionsModel>;
}
