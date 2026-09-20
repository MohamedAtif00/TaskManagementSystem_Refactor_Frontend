import { Observable } from 'rxjs';
import { TaskSheetModel } from '../../model/task-sheet.model';

export abstract class TaskSheetRemoteDataSource {
  abstract getSheet(projectId: number): Observable<TaskSheetModel>;
}
