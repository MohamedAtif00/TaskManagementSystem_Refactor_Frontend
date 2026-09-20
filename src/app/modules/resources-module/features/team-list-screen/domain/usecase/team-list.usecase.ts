import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase, NoParam } from '@core/base/usecase/base-usecase';
import { TeamEntity } from '../entity/team-list.entity';
import { TeamListRepository } from '../repository/team-list.repository';

@Injectable()
export class TeamListUseCase implements BaseUseCase<NoParam, TeamEntity[]> {
  constructor(private repository: TeamListRepository) {}

  execute(): Observable<TeamEntity[]> {
    return this.repository.getTeams();
  }
}
