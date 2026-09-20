import { Observable } from 'rxjs';
import { TaskListParams, TaskSubjectEntity } from '../entity/task-list.entity';

export abstract class TaskListRepository {
  abstract getTasks(params: TaskListParams): Observable<TaskSubjectEntity[]>;
}
