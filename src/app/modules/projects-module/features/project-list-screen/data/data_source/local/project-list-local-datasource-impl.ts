import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ProjectListParams } from '../../../domain/entity/project-list.entity';
import { ProjectRootModel } from '../../model/project-list.model';
import { ProjectListLocalDataSource } from './project-list-local-datasource';

@Injectable()
export class ProjectListLocalDataSourceImpl extends ProjectListLocalDataSource {
  private readonly rows: ProjectRootModel[] = [
    { id: 1, name: 'Primary 2026', description: 'Primary stage year root', status: 'Active', subjectCount: 12, year: '2026' },
    { id: 2, name: 'Prep 2026', description: 'Preparatory stage year root', status: 'Active', subjectCount: 9, year: '2026' },
    { id: 3, name: 'Secondary 2026', description: 'Secondary stage year root', status: 'Planning', subjectCount: 7, year: '2026' },
    { id: 4, name: 'Primary 2025', description: 'Archived year root', status: 'Closed', subjectCount: 11, year: '2025' },
  ];

  getProjects(params: ProjectListParams): Observable<ProjectRootModel[]> {
    const search = params.search.trim().toLowerCase();
    return of(this.rows).pipe(
      delay(120),
      map((rows) =>
        rows.filter(
          (row) =>
            !search ||
            row.name.toLowerCase().includes(search) ||
            row.description.toLowerCase().includes(search),
        ),
      ),
    );
  }
}
