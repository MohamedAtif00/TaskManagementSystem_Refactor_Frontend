import { Observable } from 'rxjs';
import { MemberLeaveHistory, MemberLeaveListPage, MemberLeaveListParams } from '../entity/members-leaves.entity';

export abstract class MembersLeavesRepository {
  abstract getMembers(params: MemberLeaveListParams): Observable<MemberLeaveListPage>;
  abstract getHistory(userId: number): Observable<MemberLeaveHistory>;
}
