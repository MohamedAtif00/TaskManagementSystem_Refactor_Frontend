import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { API, apiPath } from '@core/network/api/api.const';
import { CurriculumCatalogService } from '@core/network/curriculum-catalog.service';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { ProjectFormOptions, ProjectFormPayload, ProjectListParams } from '../../../domain/entity/project-list.entity';
import { ProjectRootModel } from '../../model/project-list.model';
import { ProjectListRemoteDataSource } from './project-list-remote-datasource';

interface ProjectDto {
  id: number;
  name: string;
  description?: string | null;
}

@Injectable()
export class ProjectListRemoteDataSourceImpl extends ProjectListRemoteDataSource {
  constructor(
    private catalog: CurriculumCatalogService,
    private network: NetworkService,
  ) {
    super();
  }

  getProjects(params: ProjectListParams): Observable<ProjectRootModel[]> {
    const search = params.search.trim().toLowerCase();
    return this.catalog.getTrees().pipe(
      map((trees) =>
        this.catalog
          .flattenProjects(trees)
          .filter((row) => !search || `${row.name} ${row.description} ${row.year}`.toLowerCase().includes(search)),
      ),
    );
  }

  getProject(id: number): Observable<ProjectRootModel> {
    return this.catalog.getTrees().pipe(
      map((trees) => {
        const project = this.catalog.flattenProjects(trees).find((row) => row.id === id);
        if (!project) {
          throw new Error('Project not found');
        }
        return project;
      }),
      catchError(mapHttpError),
    );
  }

  getFormOptions(): Observable<ProjectFormOptions> {
    return this.catalog.getTrees().pipe(
      map((trees) => ({
        years: trees.map((year) => ({ id: year.id, name: year.name })),
      })),
      catchError(mapHttpError),
    );
  }

  saveProject(payload: ProjectFormPayload): Observable<ProjectRootModel> {
    const body = { name: payload.name, description: payload.description || null };
    const request$ = payload.id
      ? this.network.put<ProjectDto>(apiPath(API.Curriculum.ProjectById, { id: payload.id }), body)
      : this.network.post<ProjectDto>(apiPath(API.Curriculum.YearProjects, { yearId: payload.yearId }), body);

    return request$.pipe(
      switchMap((saved) => this.getProject(saved.id)),
      catchError(mapHttpError),
    );
  }

  archiveProject(id: number): Observable<void> {
    return this.network.delete(apiPath(API.Curriculum.ProjectById, { id })).pipe(
      map(() => undefined),
      catchError(mapHttpError),
    );
  }
}
