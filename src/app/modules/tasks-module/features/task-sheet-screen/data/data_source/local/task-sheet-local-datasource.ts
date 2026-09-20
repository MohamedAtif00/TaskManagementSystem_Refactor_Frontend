import { Observable } from 'rxjs';
import { TaskSheetModel } from '../../model/task-sheet.model';

export abstract class TaskSheetLocalDataSource {
  abstract getSheet(projectId: number): Observable<TaskSheetModel>;
}
