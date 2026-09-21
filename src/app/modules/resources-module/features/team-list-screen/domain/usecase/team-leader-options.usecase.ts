import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TeamLeaderOption } from '../entity/team-list.entity';
import { TeamListRepository } from '../repository/team-list.repository';

@Injectable()
export class TeamLeaderOptionsUseCase implements BaseUseCase<void, TeamLeaderOption[]> {
  constructor(private repository: TeamListRepository) {}

  execute(): Observable<TeamLeaderOption[]> {
    return this.repository.getTeamLeaders();
  }
}
