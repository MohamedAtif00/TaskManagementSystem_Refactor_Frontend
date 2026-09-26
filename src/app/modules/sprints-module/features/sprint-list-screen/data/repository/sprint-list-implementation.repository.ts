import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  SprintEntity,
  SprintFormPayload,
  SprintListPageEntity,
  SprintListParams,
  SprintLoOption,
  SprintSubjectOption,
} from '../../domain/entity/sprint-list.entity';
import { SprintListRepository } from '../../domain/repository/sprint-list.repository';
import { SprintListLocalDataSource } from '../data_source/local/sprint-list-local-datasource';
import { SprintListRemoteDataSource } from '../data_source/remote/sprint-list-remote-datasource';
import { SprintListMapper } from '../model/sprint-list.model';

@Injectable()
export class SprintListImplementationRepository implements SprintListRepository {
  constructor(
    private local: SprintListLocalDataSource,
    private remote: SprintListRemoteDataSource,
  ) {}

  getSprints(params: SprintListParams): Observable<SprintListPageEntity> {
    const source = environment.useMock ? this.local.getSprints(params) : this.remote.getSprints(params);
    return source.pipe(
      map((page) => ({
        ...page,
        items: page.items.map((row) => SprintListMapper.toEntity(row)),
      })),
    );
  }

  saveSprint(payload: SprintFormPayload): Observable<SprintEntity> {
    const source = environment.useMock ? this.local.saveSprint(payload) : this.remote.saveSprint(payload);
    return source.pipe(map((row) => SprintListMapper.toEntity(row)));
  }

  archiveSprint(id: number, archived: boolean): Observable<SprintEntity> {
    const source = environment.useMock
      ? this.local.archiveSprint(id, archived)
      : this.remote.archiveSprint(id, archived);
    return source.pipe(map((row) => SprintListMapper.toEntity(row)));
  }

  getSubjects(): Observable<SprintSubjectOption[]> {
    return environment.useMock ? this.local.getSubjects() : this.remote.getSubjects();
  }

  getLos(subjectId: number): Observable<SprintLoOption[]> {
    return environment.useMock ? this.local.getLos(subjectId) : this.remote.getLos(subjectId);
  }
}
