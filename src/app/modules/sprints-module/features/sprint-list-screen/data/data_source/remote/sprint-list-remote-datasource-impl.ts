import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ListPageResponse } from '@core/models/list-page.model';
import { API, apiPath } from '@core/network/api/api.const';
import { CurriculumCatalogService } from '@core/network/curriculum-catalog.service';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { SprintFormPayload, SprintListParams } from '../../../domain/entity/sprint-list.entity';
import { SprintLoModel, SprintModel, SprintSubjectModel } from '../../model/sprint-list.model';
import { SprintListRemoteDataSource } from './sprint-list-remote-datasource';

interface SprintDto {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  learningObjectiveCount?: number;
  progressPercent?: number;
  learningObjectiveIds?: number[];
}

@Injectable()
export class SprintListRemoteDataSourceImpl extends SprintListRemoteDataSource {
  constructor(
    private network: NetworkService,
    private catalog: CurriculumCatalogService,
  ) {
    super();
  }

  getSprints(params: SprintListParams): Observable<ListPageResponse<SprintModel>> {
    let httpParams = new HttpParams()
      .set('archived', String(params.archived))
      .set('page', String(params.page))
      .set('pageSize', String(params.pageSize));

    return this.network.get<ListPageResponse<SprintDto>>(API.Sprints.List, httpParams).pipe(
      map((page) => ({
        items: (page.items ?? []).map((row) => this.toListModel(row, params.archived)),
        page: page.page,
        pageSize: page.pageSize,
        totalCount: page.totalCount,
      })),
      catchError(mapHttpError),
    );
  }

  saveSprint(payload: SprintFormPayload): Observable<SprintModel> {
    const body = {
      name: payload.name,
      description: payload.description,
      startDate: payload.startDate,
      endDate: payload.endDate,
    };
    const save$ = payload.id
      ? this.network.put<SprintDto>(apiPath(API.Sprints.Update, { id: payload.id }), body)
      : this.network.post<SprintDto>(API.Sprints.Create, body);

    return save$.pipe(
      switchMap((sprint) => {
        const previous = payload.previousLearningObjectIds ?? [];
        const next = payload.learningObjectIds;
        const removed = previous.filter((loId) => !next.includes(loId));
        const unlink$ = removed.length
          ? forkJoin(
              removed.map((loId) =>
                this.network
                  .delete(apiPath(API.Sprints.RemoveLearningObjective, { id: sprint.id, loId }))
                  .pipe(catchError(() => of(null))),
              ),
            ).pipe(map(() => sprint))
          : of(sprint);
        return unlink$.pipe(
          switchMap((saved) =>
            this.network
              .post(apiPath(API.Sprints.LearningObjectives, { id: saved.id }), {
                learningObjectiveIds: next,
              })
              .pipe(
                catchError(() => of(null)),
                map(() => this.toListModel({ ...saved, learningObjectiveIds: next, learningObjectiveCount: next.length }, false)),
              ),
          ),
        );
      }),
      catchError(mapHttpError),
    );
  }

  archiveSprint(id: number, archived: boolean): Observable<SprintModel> {
    if (!archived) {
      return throwError(() => new Error('Sprint restore is not supported by the API'));
    }
    return this.network.get<SprintDto>(apiPath(API.Sprints.ById, { id })).pipe(
      switchMap((sprint) =>
        this.network.delete(apiPath(API.Sprints.Archive, { id })).pipe(
          map(() => this.toListModel(sprint, true)),
        ),
      ),
      catchError(mapHttpError),
    );
  }

  getSubjects(): Observable<SprintSubjectModel[]> {
    return this.catalog.getTrees().pipe(
      map((trees) => this.catalog.flattenSubjects(trees).map((row) => ({ id: row.id, name: row.name }))),
    );
  }

  getLos(subjectId: number): Observable<SprintLoModel[]> {
    return this.catalog.getLosForSubject(subjectId);
  }

  private toListModel(sprint: SprintDto, archived: boolean): SprintModel {
    return {
      id: sprint.id,
      name: sprint.name,
      description: sprint.description ?? '',
      startDate: String(sprint.startDate).slice(0, 10),
      endDate: String(sprint.endDate).slice(0, 10),
      isArchived: archived,
      loNumber: sprint.learningObjectiveCount ?? sprint.learningObjectiveIds?.length ?? 0,
      progressPercent: sprint.progressPercent ?? 0,
      learningObjects: [],
    };
  }
}
