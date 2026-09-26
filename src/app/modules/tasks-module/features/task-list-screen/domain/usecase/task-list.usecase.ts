import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskListPageEntity, TaskListParams } from '../entity/task-list.entity';
import { TaskListRepository } from '../repository/task-list.repository';

@Injectable()
export class TaskListUseCase implements BaseUseCase<TaskListParams, TaskListPageEntity> {
  constructor(private repository: TaskListRepository) {}

  execute(params: TaskListParams): Observable<TaskListPageEntity> {
    return this.repository.getTasks(params);
  }
}
