import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TeamEntity } from '../entity/team-list.entity';
import { TeamListRepository } from '../repository/team-list.repository';

@Injectable()
export class GetTeamUseCase implements BaseUseCase<number, TeamEntity> {
  constructor(private repository: TeamListRepository) {}

  execute(id: number): Observable<TeamEntity> {
    return this.repository.getTeam(id);
  }
}
