import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { SectionEntity, SectionFormOptions, SectionFormPayload } from '../../domain/entity/section-list.entity';
import { SectionListRepository } from '../../domain/repository/section-list.repository';
import { SectionListLocalDataSource } from '../data_source/local/section-list-local-datasource';
import { SectionListRemoteDataSource } from '../data_source/remote/section-list-remote-datasource';
import { SectionListMapper } from '../model/section-list.model';

@Injectable()
export class SectionListImplementationRepository implements SectionListRepository {
  constructor(
    private local: SectionListLocalDataSource,
    private remote: SectionListRemoteDataSource,
  ) {}

  getSections(): Observable<SectionEntity[]> {
    const source = environment.useMock ? this.local.getSections() : this.remote.getSections();
    return source.pipe(map((rows) => rows.map((row) => SectionListMapper.toEntity(row))));
  }

  saveSection(payload: SectionFormPayload): Observable<SectionEntity> {
    const source = environment.useMock ? this.local.saveSection(payload) : this.remote.saveSection(payload);
    return source.pipe(map((row) => SectionListMapper.toEntity(row)));
  }

  archiveSection(id: number): Observable<void> {
    return environment.useMock ? this.local.archiveSection(id) : this.remote.archiveSection(id);
  }

  getFormOptions(): Observable<SectionFormOptions> {
    const source = environment.useMock ? this.local.getFormOptions() : this.remote.getFormOptions();
    return source.pipe(map((row) => SectionListMapper.toFormOptions(row)));
  }
}
