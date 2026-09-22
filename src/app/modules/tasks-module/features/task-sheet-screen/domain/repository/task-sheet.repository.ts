import { Observable } from 'rxjs';
import { BoardSource } from '../../../task-board-screen/domain/entity/task-board.entity';
import { TaskSheetEntity } from '../entity/task-sheet.entity';

export interface TaskSheetParams {
  source: BoardSource;
  id: number;
}

export abstract class TaskSheetRepository {
  abstract getSheet(params: TaskSheetParams): Observable<TaskSheetEntity>;
}
