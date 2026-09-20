import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskBoardEntity, TaskBoardParams } from '../entity/task-board.entity';
import { TaskBoardRepository } from '../repository/task-board.repository';

@Injectable()
export class GetTaskBoardUseCase implements BaseUseCase<TaskBoardParams, TaskBoardEntity> {
  constructor(private repository: TaskBoardRepository) {}

  execute(params: TaskBoardParams): Observable<TaskBoardEntity> {
    return this.repository.getBoard(params);
  }
}
