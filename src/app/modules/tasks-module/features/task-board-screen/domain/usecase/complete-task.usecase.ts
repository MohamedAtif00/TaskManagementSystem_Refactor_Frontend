import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskCardEntity } from '../entity/task-board.entity';
import { TaskBoardRepository } from '../repository/task-board.repository';

@Injectable()
export class CompleteTaskUseCase implements BaseUseCase<number, TaskCardEntity> {
  constructor(private repository: TaskBoardRepository) {}

  execute(id: number): Observable<TaskCardEntity> {
    return this.repository.complete(id);
  }
}
