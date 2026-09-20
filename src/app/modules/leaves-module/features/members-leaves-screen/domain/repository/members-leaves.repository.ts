import { Observable } from 'rxjs';
import { MemberLeaveHistory, MemberLeaveRow } from '../entity/members-leaves.entity';

export abstract class MembersLeavesRepository {
  abstract getMembers(): Observable<MemberLeaveRow[]>;
  abstract getHistory(userId: number): Observable<MemberLeaveHistory>;
}
