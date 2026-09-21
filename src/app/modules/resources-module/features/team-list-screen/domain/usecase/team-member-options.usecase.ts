import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TeamMemberOption } from '../entity/team-list.entity';
import { TeamListRepository } from '../repository/team-list.repository';

@Injectable()
export class TeamMemberOptionsUseCase implements BaseUseCase<void, TeamMemberOption[]> {
  constructor(private repository: TeamListRepository) {}

  execute(): Observable<TeamMemberOption[]> {
    return this.repository.getMemberOptions();
  }
}
