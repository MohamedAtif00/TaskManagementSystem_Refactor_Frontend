import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { TmsMockStore } from '@core/mock/tms-mock.store';
import { TaskListParams } from '../../../domain/entity/task-list.entity';
import { TaskSubjectModel } from '../../model/task-list.model';
import { TaskListLocalDataSource } from './task-list-local-datasource';

@Injectable()
export class TaskListLocalDataSourceImpl extends TaskListLocalDataSource {
  constructor(private store: TmsMockStore) {
    super();
  }

  getTasks(params: TaskListParams): Observable<TaskSubjectModel[]> {
    const search = params.search.trim().toLowerCase();
    return of(this.store.subjects).pipe(
      delay(120),
      map((rows) =>
        rows
          .map((row) => ({
            ...row,
            progressPercent: this.store.subjectProgress(row.id),
          }))
          .filter((row) => {
            const matchesSearch =
              !search ||
              row.name.toLowerCase().includes(search) ||
              row.folderPath.toLowerCase().includes(search);
            const matchesYear = !params.year || row.year === params.year;
            const matchesTerm = !params.term || row.term === params.term;
            return matchesSearch && matchesYear && matchesTerm;
          }),
      ),
    );
  }
}
