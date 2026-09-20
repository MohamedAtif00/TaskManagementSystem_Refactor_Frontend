import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TmsMockStore } from '@core/mock/tms-mock.store';
import { TaskSheetModel } from '../../model/task-sheet.model';
import { TaskSheetLocalDataSource } from './task-sheet-local-datasource';

@Injectable()
export class TaskSheetLocalDataSourceImpl extends TaskSheetLocalDataSource {
  constructor(private store: TmsMockStore) {
    super();
  }

  getSheet(projectId: number): Observable<TaskSheetModel> {
    const sheet = this.store.sheetFor(projectId);
    return sheet ? of(sheet).pipe(delay(120)) : throwError(() => new Error('Sheet not found'));
  }
}
