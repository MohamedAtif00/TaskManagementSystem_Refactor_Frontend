import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { TmsMockStore } from '@core/mock/tms-mock.store';
import { SprintFormPayload, SprintListParams } from '../../../domain/entity/sprint-list.entity';
import { SprintLoModel, SprintModel, SprintSubjectModel } from '../../model/sprint-list.model';
import { SprintListLocalDataSource } from './sprint-list-local-datasource';

@Injectable()
export class SprintListLocalDataSourceImpl extends SprintListLocalDataSource {
  constructor(private store: TmsMockStore) {
    super();
  }

  getSprints(params: SprintListParams): Observable<import('@core/models/list-page.model').ListPageResponse<SprintModel>> {
    return of(this.store.listSprints(params.archived)).pipe(
      delay(120),
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

  saveSprint(payload: SprintFormPayload): Observable<SprintModel> {
    const saved = payload.id
      ? this.store.updateSprint(payload.id, payload)
      : this.store.createSprint(payload);
    if (!saved) {
      return throwError(() => new Error('Sprint not found'));
    }
    const view = this.store.listSprints(saved.isArchived).find((row) => row.id === saved.id);
    return of(view ?? { ...saved, loNumber: saved.learningObjectIds.length, progressPercent: 0, learningObjects: [] }).pipe(
      delay(120),
    );
  }

  archiveSprint(id: number, archived: boolean): Observable<SprintModel> {
    const saved = this.store.archiveSprint(id, archived);
    if (!saved) {
      return throwError(() => new Error('Sprint not found'));
    }
    return of(this.store.listSprints(saved.isArchived).find((row) => row.id === saved.id)!).pipe(delay(120));
  }

  getSubjects(): Observable<SprintSubjectModel[]> {
    return of(this.store.subjects.map((row) => ({ id: row.id, name: row.name }))).pipe(delay(80));
  }

  getLos(subjectId: number): Observable<SprintLoModel[]> {
    return of(null).pipe(
      delay(80),
      map(() =>
        this.store.losForSubject(subjectId).map((lo) => ({
          id: lo.id,
          name: lo.name,
          unitName: lo.unitName,
          lessonName: lo.lessonName,
        })),
      ),
    );
  }
}
