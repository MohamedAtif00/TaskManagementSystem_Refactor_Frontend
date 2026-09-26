import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ListPageResponse } from '@core/models/list-page.model';
import { SUBJECT_STATUS_LABELS } from '@core/models/role-map';
import { API } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { TaskFilterOptions, TaskListParams } from '../../../domain/entity/task-list.entity';
import { TaskSubjectModel } from '../../model/task-list.model';
import { TaskListRemoteDataSource } from './task-list-remote-datasource';

interface SubjectCatalogDto {
  id: number;
  name: string;
  folderPath: string;
  year: string;
  term: string;
  status: number;
  progressPercent: number;
}

@Injectable()
export class TaskListRemoteDataSourceImpl extends TaskListRemoteDataSource {
  constructor(private network: NetworkService) {
    super();
  }

  getTasks(params: TaskListParams): Observable<ListPageResponse<TaskSubjectModel>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page))
      .set('pageSize', String(params.pageSize))
      .set('activeOnly', 'true');
    if (params.search.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.year) {
      httpParams = httpParams.set('year', params.year);
    }
    if (params.term) {
      httpParams = httpParams.set('term', params.term);
    }

    return this.network.get<ListPageResponse<SubjectCatalogDto>>(API.Curriculum.SubjectsCatalog, httpParams).pipe(
      map((page) => ({
        items: (page.items ?? []).map((row) => this.toModel(row)),
        page: page.page,
        pageSize: page.pageSize,
        totalCount: page.totalCount,
      })),
      catchError(mapHttpError),
    );
  }

  getFilterOptions(): Observable<TaskFilterOptions> {
    return this.network
      .get<{ years: string[]; terms: string[] }>(API.Curriculum.SubjectFilterOptions)
      .pipe(
        map((options) => ({
          years: options.years ?? [],
          terms: options.terms ?? [],
        })),
        catchError(mapHttpError),
      );
  }

  exportTasks(params: Omit<TaskListParams, 'page' | 'pageSize'>): Observable<TaskSubjectModel[]> {
    let httpParams = new HttpParams().set('activeOnly', 'true');
    if (params.search.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.year) {
      httpParams = httpParams.set('year', params.year);
    }
    if (params.term) {
      httpParams = httpParams.set('term', params.term);
    }

    return this.network.get<SubjectCatalogDto[]>(API.Curriculum.SubjectsExport, httpParams).pipe(
      map((rows) => rows.map((row) => this.toModel(row))),
      catchError(mapHttpError),
    );
  }

  private toModel(row: SubjectCatalogDto): TaskSubjectModel {
    return {
      id: row.id,
      name: row.name,
      folderPath: row.folderPath,
      year: row.year,
      term: row.term,
      status: SUBJECT_STATUS_LABELS[row.status] ?? String(row.status),
      progressPercent: row.progressPercent,
    };
  }
}
