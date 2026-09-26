import { Observable } from 'rxjs';
import { ListPageResponse } from '@core/models/list-page.model';
import { MemberLeaveHistoryModel, MemberLeaveRowModel } from '../../model/members-leaves.model';

export abstract class MembersLeavesRemoteDataSource {
  abstract getMembers(page: number, pageSize: number): Observable<ListPageResponse<MemberLeaveRowModel>>;
  abstract getHistory(userId: number): Observable<MemberLeaveHistoryModel>;
}
