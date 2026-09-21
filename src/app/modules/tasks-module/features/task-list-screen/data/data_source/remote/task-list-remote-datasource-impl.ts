import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, toArray } from 'rxjs/operators';

const SUBJECT_STATS_CONCURRENCY = 4;
import { CurriculumCatalogService } from '@core/network/curriculum-catalog.service';
import { TicketStatsService } from '@core/network/ticket-stats.service';
import { TaskFilterOptions, TaskListParams } from '../../../domain/entity/task-list.entity';
import { TaskSubjectModel } from '../../model/task-list.model';
import { TaskListRemoteDataSource } from './task-list-remote-datasource';

@Injectable()
export class TaskListRemoteDataSourceImpl extends TaskListRemoteDataSource {
  constructor(
    private catalog: CurriculumCatalogService,
    private ticketStats: TicketStatsService,
  ) {
    super();
  }

  getTasks(params: TaskListParams): Observable<TaskSubjectModel[]> {
    const search = params.search.trim().toLowerCase();
    return this.catalog.getTrees().pipe(
      map((trees) =>
        this.catalog
          .flattenSubjects(trees)
          .filter((row) => !params.year || row.year === params.year)
          .filter((row) => !params.term || row.term === params.term)
          .filter((row) => !search || `${row.name} ${row.folderPath}`.toLowerCase().includes(search)),
      ),
      switchMap((subjects) => {
        if (!subjects.length) {
          return of([] as TaskSubjectModel[]);
        }
        return from(subjects).pipe(
          mergeMap(
            (subject) =>
              this.ticketStats.loadSubjectStats(subject.id).pipe(
                map((stats) => ({ ...subject, progressPercent: stats.progressPercent })),
                catchError(() => of({ ...subject, progressPercent: 0 })),
              ),
            SUBJECT_STATS_CONCURRENCY,
          ),
          toArray(),
        );
      }),
    );
  }

  getFilterOptions(): Observable<TaskFilterOptions> {
    return this.catalog.getTrees().pipe(
      map((trees) => {
        const subjects = this.catalog.flattenSubjects(trees);
        return {
          years: [...new Set(subjects.map((row) => row.year))].sort((a, b) => b.localeCompare(a)),
          terms: [...new Set(subjects.map((row) => row.term))].sort((a, b) => a.localeCompare(b)),
        };
      }),
    );
  }
}
