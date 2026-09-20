import { Observable } from 'rxjs';
import { TaskSheetEntity } from '../entity/task-sheet.entity';

export abstract class TaskSheetRepository {
  abstract getSheet(projectId: number): Observable<TaskSheetEntity>;
}
