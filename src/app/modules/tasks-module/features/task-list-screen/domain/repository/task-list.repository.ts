import { Observable } from 'rxjs';
import { TaskFilterOptions, TaskListPageEntity, TaskListParams, TaskSubjectEntity } from '../entity/task-list.entity';

export abstract class TaskListRepository {
  abstract getTasks(params: TaskListParams): Observable<TaskListPageEntity>;
  abstract getFilterOptions(): Observable<TaskFilterOptions>;
  abstract exportTasks(params: Omit<TaskListParams, 'page' | 'pageSize'>): Observable<TaskSubjectEntity[]>;
}
