import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { MemberLeaveListPage, MemberLeaveListParams } from '../entity/members-leaves.entity';
import { MembersLeavesRepository } from '../repository/members-leaves.repository';

@Injectable()
export class GetMembersLeavesUseCase implements BaseUseCase<MemberLeaveListParams, MemberLeaveListPage> {
  constructor(private repository: MembersLeavesRepository) {}

  execute(params: MemberLeaveListParams): Observable<MemberLeaveListPage> {
    return this.repository.getMembers(params);
  }
}
