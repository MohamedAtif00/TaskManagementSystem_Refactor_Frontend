import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskColumnPageEntity, TaskColumnPageParams } from '../entity/task-board.entity';
import { TaskBoardRepository } from '../repository/task-board.repository';

@Injectable()
export class GetTaskColumnPageUseCase implements BaseUseCase<TaskColumnPageParams, TaskColumnPageEntity> {
  constructor(private repository: TaskBoardRepository) {}

  execute(params: TaskColumnPageParams): Observable<TaskColumnPageEntity> {
    return this.repository.getColumnPage(params);
  }
}
