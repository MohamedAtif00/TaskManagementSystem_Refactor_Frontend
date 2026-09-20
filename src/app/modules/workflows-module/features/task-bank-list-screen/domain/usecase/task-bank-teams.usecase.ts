import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase, NoParam } from '@core/base/usecase/base-usecase';
import { TaskBankTeamOption } from '../entity/task-bank-list.entity';
import { TaskBankListRepository } from '../repository/task-bank-list.repository';

@Injectable()
export class TaskBankTeamsUseCase implements BaseUseCase<NoParam, TaskBankTeamOption[]> {
  constructor(private repository: TaskBankListRepository) {}

  execute(): Observable<TaskBankTeamOption[]> {
    return this.repository.listTeams();
  }
}
