import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { TmsMockStore } from '@core/mock/tms-mock.store';
import { ListPageResponse } from '@core/models/list-page.model';
import { TaskFilterOptions, TaskListParams } from '../../../domain/entity/task-list.entity';
import { TaskSubjectModel } from '../../model/task-list.model';
import { TaskListLocalDataSource } from './task-list-local-datasource';

@Injectable()
export class TaskListLocalDataSourceImpl extends TaskListLocalDataSource {
  constructor(private store: TmsMockStore) {
    super();
  }

  getTasks(params: TaskListParams): Observable<ListPageResponse<TaskSubjectModel>> {
    return this.filterRows(params).pipe(
      map((rows) => {
        const start = (params.page - 1) * params.pageSize;
        return {
          items: rows.slice(start, start + params.pageSize),
          page: params.page,
          pageSize: params.pageSize,
          totalCount: rows.length,
        };
      }),
    );
  }

  exportTasks(params: Omit<TaskListParams, 'page' | 'pageSize'>): Observable<TaskSubjectModel[]> {
    return this.filterRows({ ...params, page: 1, pageSize: Number.MAX_SAFE_INTEGER });
  }

  getFilterOptions(): Observable<TaskFilterOptions> {
    return of(this.store.subjects).pipe(
      delay(80),
      map((rows) => ({
        years: [...new Set(rows.map((row) => row.year))].sort((a, b) => b.localeCompare(a)),
        terms: [...new Set(rows.map((row) => row.term))].sort((a, b) => a.localeCompare(b)),
      })),
    );
  }

  private filterRows(params: TaskListParams): Observable<TaskSubjectModel[]> {
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
            const isActive = row.status === 'Active';
            return matchesSearch && matchesYear && matchesTerm && isActive;
          }),
      ),
    );
  }
}
