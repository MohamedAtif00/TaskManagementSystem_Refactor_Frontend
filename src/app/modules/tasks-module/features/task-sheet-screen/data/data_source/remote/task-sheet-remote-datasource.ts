import { Observable } from 'rxjs';
import { TaskSheetParams } from '../../../domain/repository/task-sheet.repository';
import { TaskSheetModel } from '../../model/task-sheet.model';

export abstract class TaskSheetRemoteDataSource {
  abstract getSheet(params: TaskSheetParams): Observable<TaskSheetModel>;
}
