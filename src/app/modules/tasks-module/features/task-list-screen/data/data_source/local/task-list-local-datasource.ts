import { Observable } from 'rxjs';
import { ListPageResponse } from '@core/models/list-page.model';
import { TaskFilterOptions, TaskListParams } from '../../../domain/entity/task-list.entity';
import { TaskSubjectModel } from '../../model/task-list.model';

export abstract class TaskListLocalDataSource {
  abstract getTasks(params: TaskListParams): Observable<ListPageResponse<TaskSubjectModel>>;
  abstract getFilterOptions(): Observable<TaskFilterOptions>;
  abstract exportTasks(params: Omit<TaskListParams, 'page' | 'pageSize'>): Observable<TaskSubjectModel[]>;
}
