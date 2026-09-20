import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { TaskListParams, TaskSubjectEntity } from '../entity/task-list.entity';
import { TaskListRepository } from '../repository/task-list.repository';

@Injectable()
export class TaskListUseCase implements BaseUseCase<TaskListParams, TaskSubjectEntity[]> {
  constructor(private repository: TaskListRepository) {}

  execute(params: TaskListParams): Observable<TaskSubjectEntity[]> {
    return this.repository.getTasks(params);
  }
}
