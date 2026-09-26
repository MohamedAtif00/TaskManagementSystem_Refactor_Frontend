import { Observable } from 'rxjs';
import { ListPageResponse } from '@core/models/list-page.model';
import { MemberLeaveListParams } from '../../../domain/entity/members-leaves.entity';
import { MemberLeaveHistoryModel, MemberLeaveRowModel } from '../../model/members-leaves.model';

export abstract class MembersLeavesLocalDataSource {
  abstract getMembers(params: MemberLeaveListParams): Observable<ListPageResponse<MemberLeaveRowModel>>;
  abstract getHistory(userId: number): Observable<MemberLeaveHistoryModel>;
}
