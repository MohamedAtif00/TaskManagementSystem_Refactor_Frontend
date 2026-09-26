import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { TaskFilterOptions, TaskListPageEntity, TaskListParams, TaskSubjectEntity } from '../../domain/entity/task-list.entity';
import { TaskListRepository } from '../../domain/repository/task-list.repository';
import { TaskListLocalDataSource } from '../data_source/local/task-list-local-datasource';
import { TaskListRemoteDataSource } from '../data_source/remote/task-list-remote-datasource';
import { TaskListMapper } from '../model/task-list.model';

@Injectable()
export class TaskListImplementationRepository implements TaskListRepository {
  constructor(
    private local: TaskListLocalDataSource,
    private remote: TaskListRemoteDataSource,
  ) {}

  getTasks(params: TaskListParams): Observable<TaskListPageEntity> {
    const source = environment.useMock ? this.local.getTasks(params) : this.remote.getTasks(params);
    return source.pipe(
      map((page) => ({
        ...page,
        items: page.items.map((row) => TaskListMapper.toEntity(row)),
      })),
    );
  }

  getFilterOptions(): Observable<TaskFilterOptions> {
    return environment.useMock ? this.local.getFilterOptions() : this.remote.getFilterOptions();
  }

  exportTasks(params: Omit<TaskListParams, 'page' | 'pageSize'>): Observable<TaskSubjectEntity[]> {
    const source = environment.useMock ? this.local.exportTasks(params) : this.remote.exportTasks(params);
    return source.pipe(map((rows) => rows.map((row) => TaskListMapper.toEntity(row))));
  }
}
