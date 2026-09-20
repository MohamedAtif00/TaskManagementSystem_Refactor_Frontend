import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskDetailsEntity } from '../entity/task-board.entity';
import { TaskBoardRepository } from '../repository/task-board.repository';

@Injectable()
export class GetTaskDetailsUseCase implements BaseUseCase<number, TaskDetailsEntity> {
  constructor(private repository: TaskBoardRepository) {}

  execute(id: number): Observable<TaskDetailsEntity> {
    return this.repository.getTask(id);
  }
}
