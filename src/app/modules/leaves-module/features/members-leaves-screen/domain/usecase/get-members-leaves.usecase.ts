import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase, NoParam } from '@core/base/usecase/base-usecase';
import { MemberLeaveRow } from '../entity/members-leaves.entity';
import { MembersLeavesRepository } from '../repository/members-leaves.repository';

@Injectable()
export class GetMembersLeavesUseCase implements BaseUseCase<NoParam, MemberLeaveRow[]> {
  constructor(private repository: MembersLeavesRepository) {}

  execute(_params: NoParam): Observable<MemberLeaveRow[]> {
    return this.repository.getMembers();
  }
}
