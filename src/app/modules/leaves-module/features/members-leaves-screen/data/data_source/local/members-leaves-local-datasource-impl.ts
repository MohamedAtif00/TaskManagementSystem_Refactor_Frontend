import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TmsMockStore } from '@core/mock/tms-mock.store';
import { MemberLeaveHistoryModel, MemberLeaveRowModel } from '../../model/members-leaves.model';
import { MembersLeavesLocalDataSource } from './members-leaves-local-datasource';

@Injectable()
export class MembersLeavesLocalDataSourceImpl extends MembersLeavesLocalDataSource {
  constructor(private store: TmsMockStore) {
    super();
  }

  getMembers(): Observable<MemberLeaveRowModel[]> {
    return of(
      this.store.memberBalances().map((user) => ({
        id: user.id,
        name: user.name,
        code: user.code,
        balances: user.balances,
      })),
    ).pipe(delay(120));
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
