import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ProjectFormOptions, ProjectFormPayload, ProjectListParams } from '../../../domain/entity/project-list.entity';
import { ProjectRootModel } from '../../model/project-list.model';
import { ProjectListLocalDataSource } from './project-list-local-datasource';

@Injectable()
export class ProjectListLocalDataSourceImpl extends ProjectListLocalDataSource {
  private readonly years = [
    { id: 1, name: '2026' },
    { id: 2, name: '2025' },
  ];

  private rows: ProjectRootModel[] = [
    {
      id: 1,
      name: 'Primary 2026',
      description: 'Primary stage year root',
      status: 'Active',
      subjectCount: 12,
      year: '2026',
      yearId: 1,
    },
    {
      id: 2,
      name: 'Prep 2026',
      description: 'Preparatory stage year root',
      status: 'Active',
      subjectCount: 9,
      year: '2026',
      yearId: 1,
    },
    {
      id: 3,
      name: 'Secondary 2026',
      description: 'Secondary stage year root',
      status: 'Planning',
      subjectCount: 7,
      year: '2026',
      yearId: 1,
    },
    {
      id: 4,
      name: 'Primary 2025',
      description: 'Archived year root',
      status: 'Closed',
      subjectCount: 11,
      year: '2025',
      yearId: 2,
    },
  ];

  private nextId = 5;

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

  getProject(id: number): Observable<ProjectRootModel> {
    const row = this.rows.find((item) => item.id === id);
    if (!row) {
      return throwError(() => new Error('Project not found'));
    }
    return of({ ...row }).pipe(delay(80));
  }

  getFormOptions(): Observable<ProjectFormOptions> {
    return of({ years: this.years }).pipe(delay(80));
  }

  saveProject(payload: ProjectFormPayload): Observable<ProjectRootModel> {
    const year = this.years.find((item) => item.id === payload.yearId);
    if (!year) {
      return throwError(() => new Error('Year is required'));
    }

    if (payload.id) {
      const index = this.rows.findIndex((item) => item.id === payload.id);
      if (index < 0) {
        return throwError(() => new Error('Project not found'));
      }
      this.rows[index] = {
        ...this.rows[index],
        name: payload.name,
        description: payload.description,
        year: year.name,
        yearId: year.id,
      };
      return of({ ...this.rows[index] }).pipe(delay(120));
    }

    const created: ProjectRootModel = {
      id: this.nextId++,
      name: payload.name,
      description: payload.description,
      status: 'Active',
      subjectCount: 0,
      year: year.name,
      yearId: year.id,
    };
    this.rows = [...this.rows, created];
    return of(created).pipe(delay(120));
  }

  archiveProject(id: number): Observable<void> {
    const before = this.rows.length;
    this.rows = this.rows.filter((row) => row.id !== id);
    if (this.rows.length === before) {
      return throwError(() => new Error('Project not found'));
    }
    return of(undefined).pipe(delay(120));
  }
}
