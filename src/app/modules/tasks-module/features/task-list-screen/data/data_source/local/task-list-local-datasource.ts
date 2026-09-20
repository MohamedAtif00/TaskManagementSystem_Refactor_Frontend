import { Observable } from 'rxjs';
import { TaskListParams } from '../../../domain/entity/task-list.entity';
import { TaskSubjectModel } from '../../model/task-list.model';

export abstract class TaskListLocalDataSource {
  abstract getTasks(params: TaskListParams): Observable<TaskSubjectModel[]>;
}
