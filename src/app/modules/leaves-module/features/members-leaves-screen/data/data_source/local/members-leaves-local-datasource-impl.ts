import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ListPageResponse } from '@core/models/list-page.model';
import { TmsMockStore } from '@core/mock/tms-mock.store';
import { MemberLeaveListParams } from '../../../domain/entity/members-leaves.entity';
import { MemberLeaveHistoryModel, MemberLeaveRowModel } from '../../model/members-leaves.model';
import { MembersLeavesLocalDataSource } from './members-leaves-local-datasource';

@Injectable()
export class MembersLeavesLocalDataSourceImpl extends MembersLeavesLocalDataSource {
  constructor(private store: TmsMockStore) {
    super();
  }

  getMembers(params: MemberLeaveListParams): Observable<ListPageResponse<MemberLeaveRowModel>> {
    const all = this.store.memberBalances().map((user) => ({
      id: user.id,
      name: user.name,
      code: user.code,
      balances: user.balances,
    }));
    const skip = (params.page - 1) * params.pageSize;
    return of({
      items: all.slice(skip, skip + params.pageSize),
      page: params.page,
      pageSize: params.pageSize,
      totalCount: all.length,
    }).pipe(delay(120));
  }

  getHistory(userId: number): Observable<MemberLeaveHistoryModel> {
    const user = this.store.getUser(userId);
    if (!user) {
      return throwError(() => new Error('User not found'));
    }
    const filters = { userId };
    return of({
      user: { id: user.id, name: user.name, code: user.code },
      balances: user.balances,
      leaves: this.store.listLeaves(filters),
      permissions: this.store.listPermissions(filters),
      wfh: this.store.listWfh(filters),
    }).pipe(delay(120));
  }
}
