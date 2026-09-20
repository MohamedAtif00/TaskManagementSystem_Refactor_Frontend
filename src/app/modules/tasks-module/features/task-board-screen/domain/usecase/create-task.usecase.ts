import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { CreateTaskPayload, TaskCardEntity } from '../entity/task-board.entity';
import { TaskBoardRepository } from '../repository/task-board.repository';

@Injectable()
export class CreateTaskUseCase implements BaseUseCase<CreateTaskPayload, TaskCardEntity> {
  constructor(private repository: TaskBoardRepository) {}

  execute(params: CreateTaskPayload): Observable<TaskCardEntity> {
    return this.repository.createTask(params);
  }
}
