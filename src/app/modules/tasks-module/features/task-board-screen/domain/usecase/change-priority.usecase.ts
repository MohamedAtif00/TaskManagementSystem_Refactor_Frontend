import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { ChangePriorityPayload, TaskCardEntity } from '../entity/task-board.entity';
import { TaskBoardRepository } from '../repository/task-board.repository';

@Injectable()
export class ChangePriorityUseCase implements BaseUseCase<ChangePriorityPayload, TaskCardEntity> {
  constructor(private repository: TaskBoardRepository) {}

  execute(payload: ChangePriorityPayload): Observable<TaskCardEntity> {
    return this.repository.changePriority(payload);
  }
}
