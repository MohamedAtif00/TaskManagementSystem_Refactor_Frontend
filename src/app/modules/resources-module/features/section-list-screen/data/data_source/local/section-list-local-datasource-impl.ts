import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TmsMockStore } from '@core/mock/tms-mock.store';
import { SectionFormPayload } from '../../../domain/entity/section-list.entity';
import { SectionFormOptionsModel, SectionModel } from '../../model/section-list.model';
import { SectionListLocalDataSource } from './section-list-local-datasource';

@Injectable()
export class SectionListLocalDataSourceImpl extends SectionListLocalDataSource {
  constructor(private store: TmsMockStore) {
    super();
  }

  getSections(): Observable<SectionModel[]> {
    return of(this.store.listSections().map((row) => this.toModel(row))).pipe(delay(80));
  }

  saveSection(payload: SectionFormPayload): Observable<SectionModel> {
    const saved = this.store.saveSection(payload);
    if (!saved) {
      return throwError(() => new Error('Section not found'));
    }
    return of(this.toModel(saved)).pipe(delay(80));
  }

  archiveSection(id: number): Observable<void> {
    if (!this.store.archiveSection(id)) {
      return throwError(() => new Error('Section not found'));
    }
    return of(undefined).pipe(delay(80));
  }

  getFormOptions(): Observable<SectionFormOptionsModel> {
    return of({
      heads: this.store.listAdminUsers().map((row) => ({ id: row.id, name: row.name })),
      teams: this.store.listTeams().map((row) => ({ id: row.id, name: row.name })),
    }).pipe(delay(80));
  }

  private toModel(row: NonNullable<ReturnType<TmsMockStore['getSection']>>): SectionModel {
    return {
      id: row.id,
      name: row.name,
      headId: row.head.id,
      headName: row.head.name,
      teams: row.teams,
    };
  }
}
