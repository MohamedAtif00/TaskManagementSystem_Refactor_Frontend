import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  ProjectFormOptions,
  ProjectFormPayload,
  ProjectListParams,
  ProjectRootEntity,
} from '../../domain/entity/project-list.entity';
import { ProjectListRepository } from '../../domain/repository/project-list.repository';
import { ProjectListLocalDataSource } from '../data_source/local/project-list-local-datasource';
import { ProjectListRemoteDataSource } from '../data_source/remote/project-list-remote-datasource';
import { ProjectListMapper } from '../model/project-list.model';

@Injectable()
export class ProjectListImplementationRepository implements ProjectListRepository {
  constructor(
    private local: ProjectListLocalDataSource,
    private remote: ProjectListRemoteDataSource,
  ) {}

  getProjects(params: ProjectListParams): Observable<ProjectRootEntity[]> {
    return this.pickSource()
      .getProjects(params)
      .pipe(map((rows) => rows.map((row) => ProjectListMapper.toEntity(row))));
  }

  getProject(id: number): Observable<ProjectRootEntity> {
    return this.pickSource()
      .getProject(id)
      .pipe(map((row) => ProjectListMapper.toEntity(row)));
  }

  getFormOptions(): Observable<ProjectFormOptions> {
    return this.pickSource().getFormOptions();
  }

  saveProject(payload: ProjectFormPayload): Observable<ProjectRootEntity> {
    return this.pickSource()
      .saveProject(payload)
      .pipe(map((row) => ProjectListMapper.toEntity(row)));
  }

  archiveProject(id: number): Observable<void> {
    return this.pickSource().archiveProject(id);
  }

  private pickSource(): ProjectListLocalDataSource | ProjectListRemoteDataSource {
    return environment.useMock ? this.local : this.remote;
  }
}
