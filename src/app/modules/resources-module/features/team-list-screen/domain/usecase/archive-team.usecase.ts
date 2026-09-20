import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TeamListRepository } from '../repository/team-list.repository';

@Injectable()
export class ArchiveTeamUseCase implements BaseUseCase<number, void> {
  constructor(private repository: TeamListRepository) {}

  execute(id: number): Observable<void> {
    return this.repository.archiveTeam(id);
  }
}
