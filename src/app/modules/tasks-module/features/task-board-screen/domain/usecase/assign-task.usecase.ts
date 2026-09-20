import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { AssignTaskPayload, TaskCardEntity } from '../entity/task-board.entity';
import { TaskBoardRepository } from '../repository/task-board.repository';

@Injectable()
export class AssignTaskUseCase implements BaseUseCase<AssignTaskPayload, TaskCardEntity> {
  constructor(private repository: TaskBoardRepository) {}

  execute(params: AssignTaskPayload): Observable<TaskCardEntity> {
    return this.repository.assign(params);
  }
}
