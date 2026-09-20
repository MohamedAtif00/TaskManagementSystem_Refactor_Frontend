import { Observable } from 'rxjs';
import { MemberLeaveHistoryModel, MemberLeaveRowModel } from '../../model/members-leaves.model';

export abstract class MembersLeavesRemoteDataSource {
  abstract getMembers(): Observable<MemberLeaveRowModel[]>;
  abstract getHistory(userId: number): Observable<MemberLeaveHistoryModel>;
}
