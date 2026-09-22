import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskBoardPageEntity, TaskBoardPageParams } from '../entity/task-board.entity';
import { TaskBoardRepository } from '../repository/task-board.repository';

@Injectable()
export class GetTaskBoardPageUseCase implements BaseUseCase<TaskBoardPageParams, TaskBoardPageEntity> {
  constructor(private repository: TaskBoardRepository) {}

  execute(params: TaskBoardPageParams): Observable<TaskBoardPageEntity> {
    return this.repository.getBoardPage(params);
  }
}
