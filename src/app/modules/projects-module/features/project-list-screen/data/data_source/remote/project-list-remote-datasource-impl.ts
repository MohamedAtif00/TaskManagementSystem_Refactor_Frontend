import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CurriculumCatalogService } from '@core/network/curriculum-catalog.service';
import { ProjectListParams } from '../../../domain/entity/project-list.entity';
import { ProjectRootModel } from '../../model/project-list.model';
import { ProjectListRemoteDataSource } from './project-list-remote-datasource';

@Injectable()
export class ProjectListRemoteDataSourceImpl extends ProjectListRemoteDataSource {
  constructor(private catalog: CurriculumCatalogService) {
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
}
