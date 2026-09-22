import { Observable } from 'rxjs';
import { TaskSheetParams } from '../../../domain/repository/task-sheet.repository';
import { TaskSheetModel } from '../../model/task-sheet.model';

export abstract class TaskSheetLocalDataSource {
  abstract getSheet(params: TaskSheetParams): Observable<TaskSheetModel>;
}
