import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { MemberLeaveHistory } from '../entity/members-leaves.entity';
import { MembersLeavesRepository } from '../repository/members-leaves.repository';

@Injectable()
export class GetMemberLeaveHistoryUseCase implements BaseUseCase<number, MemberLeaveHistory> {
  constructor(private repository: MembersLeavesRepository) {}

  execute(userId: number): Observable<MemberLeaveHistory> {
    return this.repository.getHistory(userId);
  }
}
