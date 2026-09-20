import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TeamEntity, TeamFormPayload } from '../entity/team-list.entity';
import { TeamListRepository } from '../repository/team-list.repository';

@Injectable()
export class SaveTeamUseCase implements BaseUseCase<TeamFormPayload, TeamEntity> {
  constructor(private repository: TeamListRepository) {}

  execute(payload: TeamFormPayload): Observable<TeamEntity> {
    return this.repository.saveTeam(payload);
  }
}
