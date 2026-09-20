import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ProjectListParams, ProjectRootEntity } from '../../domain/entity/project-list.entity';
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
    const source = environment.useMock
      ? this.local.getProjects(params)
      : this.remote.getProjects(params);
    return source.pipe(map((rows) => rows.map((row) => ProjectListMapper.toEntity(row))));
  }
}
