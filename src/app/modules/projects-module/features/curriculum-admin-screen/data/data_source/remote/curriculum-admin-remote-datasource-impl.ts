import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { API, apiPath } from '@core/network/api/api.const';
import { CurriculumCatalogService, YearTree } from '@core/network/curriculum-catalog.service';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { UserDirectoryService } from '@core/network/user-directory.service';
import {
  ArchiveCurriculumPayload,
  CurriculumKind,
  CurriculumNode,
  SaveCurriculumPayload,
} from '../../../domain/entity/curriculum-admin.entity';
import { CurriculumNodeModel, CurriculumSchemaModel, CurriculumUserModel } from '../../model/curriculum-admin.model';
import { CurriculumAdminRemoteDataSource } from './curriculum-admin-remote-datasource';

interface NamedDto {
  id: number;
  name: string;
  description?: string;
}

function toDateInput(value?: string | null): string | undefined {
  return value ? String(value).slice(0, 10) : undefined;
}

@Injectable()
export class CurriculumAdminRemoteDataSourceImpl extends CurriculumAdminRemoteDataSource {
  constructor(
    private network: NetworkService,
    private catalog: CurriculumCatalogService,
    private users: UserDirectoryService,
  ) {
    super();
  }

  getTree(): Observable<CurriculumNodeModel[]> {
    return this.catalog.getTrees().pipe(map((trees) => trees.map((tree) => this.fromYear(tree))));
  }

  loadChildren(node: CurriculumNode): Observable<CurriculumNodeModel[]> {
    if (node.kind !== 'subject') {
      return of(node.children);
    }
    return this.catalog.getSubjectSheet(node.id).pipe(
      map((sheet) =>
        sheet.units.map((unit) => ({
          key: `unit-${unit.id}`,
          id: unit.id,
          kind: 'unit' as const,
          name: unit.name,
          childrenLoaded: true,
          children: unit.lessons.map((lesson) => ({
            key: `lesson-${lesson.id}`,
            id: lesson.id,
            kind: 'lesson' as const,
            name: lesson.name,
            childrenLoaded: true,
            children: lesson.learningObjectives.map((lo) => ({
              key: `lo-${lo.id}`,
              id: lo.id,
              kind: 'lo' as const,
              name: lo.name,
              tag: lo.tag,
              template: lo.template,
              environment: lo.environment,
              children: [],
              childrenLoaded: true,
            })),
          })),
        })),
      ),
    );
  }

  save(payload: SaveCurriculumPayload): Observable<void> {
    return this.ensureSchema(payload).pipe(
      switchMap((ready) => this.write(ready)),
      switchMap((saved) => {
        if (payload.kind === 'subject' && payload.id != null && payload.status != null) {
          return this.network
            .put(apiPath(API.Curriculum.SubjectStatus, { id: payload.id }), { status: payload.status })
            .pipe(map(() => saved));
        }
        return of(saved);
      }),
      switchMap((saved) => {
        if (payload.kind === 'subject' && payload.userIds != null) {
          const subjectId = payload.id ?? saved.id;
          return this.replaceSubjectUsers(subjectId, payload.userIds).pipe(map(() => saved));
        }
        return of(saved);
      }),
      map(() => undefined),
      catchError(mapHttpError),
    );
  }

  archive(payload: ArchiveCurriculumPayload): Observable<void> {
    return this.network.delete(this.archiveUrl(payload.kind, payload.id)).pipe(
      map(() => undefined),
      catchError(mapHttpError),
    );
  }

  listSchemas(): Observable<CurriculumSchemaModel[]> {
    return this.network.get<CurriculumSchemaModel[]>(API.Schemas.List).pipe(
      map((rows) => (Array.isArray(rows) ? rows.map((row) => ({ id: row.id, name: row.name })) : [])),
      catchError(() => of([] as CurriculumSchemaModel[])),
    );
  }

  listUsers(): Observable<CurriculumUserModel[]> {
    return this.users.refresh().pipe(map((rows) => rows.map((row) => ({ id: row.id, name: row.name }))));
  }

  getSubjectUsers(subjectId: number): Observable<number[]> {
    return this.network
      .get<{ id: number; name: string }[]>(apiPath(API.Curriculum.SubjectUsers, { id: subjectId }))
      .pipe(
        map((rows) => rows.map((row) => row.id)),
        catchError(() => of([] as number[])),
      );
  }

  private ensureSchema(payload: SaveCurriculumPayload): Observable<SaveCurriculumPayload> {
    if (payload.kind !== 'lo' || payload.id != null || payload.schemaId) {
      return of(payload);
    }
    return this.listSchemas().pipe(
      switchMap((schemas) => {
        if (schemas[0]) {
          return of({ ...payload, schemaId: schemas[0].id });
        }
        return this.network
          .post<{ id: number }>(API.Schemas.Create, { name: 'Default', description: '', typeId: null })
          .pipe(map((schema) => ({ ...payload, schemaId: schema.id })));
      }),
    );
  }

  private write(payload: SaveCurriculumPayload): Observable<NamedDto> {
    if (payload.id != null) {
      return this.network.put<NamedDto>(this.updateUrl(payload.kind, payload.id), this.updateBody(payload));
    }
    return this.network.post<NamedDto>(this.createUrl(payload), this.createBody(payload));
  }

  private replaceSubjectUsers(subjectId: number, userIds: number[]): Observable<unknown> {
    return this.getSubjectUsers(subjectId).pipe(
      switchMap((current) => {
        const add = userIds.filter((id) => !current.includes(id));
        const remove = current.filter((id) => !userIds.includes(id));
        const ops: Observable<unknown>[] = [];
        if (add.length) {
          ops.push(this.network.post(apiPath(API.Curriculum.SubjectUsers, { id: subjectId }), { userIds: add }));
        }
        if (remove.length) {
          ops.push(this.network.post(apiPath(API.Curriculum.SubjectUnassign, { id: subjectId }), { userIds: remove }));
        }
        return ops.length ? forkJoin(ops) : of(null);
      }),
    );
  }

  private createUrl(payload: SaveCurriculumPayload): string {
    const parentId = payload.parentId ?? 0;
    switch (payload.kind) {
      case 'year':
        return API.Curriculum.Years;
      case 'project':
        return apiPath(API.Curriculum.YearProjects, { yearId: parentId });
      case 'term':
        return apiPath(API.Curriculum.ProjectTerms, { projectId: parentId });
      case 'group':
        return apiPath(API.Curriculum.TermGroups, { termId: parentId });
      case 'subject':
        return apiPath(API.Curriculum.GroupSubjects, { subjectGroupId: parentId });
      case 'unit':
        return apiPath(API.Curriculum.SubjectUnits, { subjectId: parentId });
      case 'lesson':
        return apiPath(API.Curriculum.UnitLessons, { unitId: parentId });
      case 'lo':
        return apiPath(API.Curriculum.LessonLos, { lessonId: parentId });
    }
  }

  private updateUrl(kind: CurriculumKind, id: number): string {
    switch (kind) {
      case 'year':
        return apiPath(API.Curriculum.YearById, { id });
      case 'project':
        return apiPath(API.Curriculum.ProjectById, { id });
      case 'term':
        return apiPath(API.Curriculum.TermById, { id });
      case 'group':
        return apiPath(API.Curriculum.GroupById, { id });
      case 'subject':
        return apiPath(API.Curriculum.Subject, { id });
      case 'unit':
        return apiPath(API.Curriculum.UnitById, { id });
      case 'lesson':
        return apiPath(API.Curriculum.LessonById, { id });
      case 'lo':
        return apiPath(API.Curriculum.LearningObjective, { id });
    }
  }

  private archiveUrl(kind: CurriculumKind, id: number): string {
    return this.updateUrl(kind, id);
  }

  private createBody(payload: SaveCurriculumPayload): unknown {
    if (payload.kind === 'year' || payload.kind === 'project') {
      return { name: payload.name, description: payload.description || null };
    }
    if (payload.kind === 'term') {
      return { name: payload.name, startDate: payload.startDate || null, endDate: payload.endDate || null };
    }
    if (payload.kind === 'subject') {
      return { name: payload.name, description: payload.description || '' };
    }
    if (payload.kind === 'lo') {
      return {
        schemaId: payload.schemaId,
        name: payload.name,
        tag: payload.tag || '',
        template: payload.template || '',
        environment: payload.environment || '',
      };
    }
    return { name: payload.name };
  }

  private updateBody(payload: SaveCurriculumPayload): unknown {
    if (payload.kind === 'lo') {
      return {
        name: payload.name,
        tag: payload.tag || '',
        template: payload.template || '',
        environment: payload.environment || '',
      };
    }
    return this.createBody(payload);
  }

  private fromYear(tree: YearTree): CurriculumNodeModel {
    return {
      key: `year-${tree.id}`,
      id: tree.id,
      kind: 'year',
      name: tree.name,
      description: tree.description,
      childrenLoaded: true,
      children: (tree.projects ?? []).map((project) => ({
        key: `project-${project.id}`,
        id: project.id,
        kind: 'project' as const,
        name: project.name,
        description: project.description,
        childrenLoaded: true,
        children: (project.terms ?? []).map((term) => ({
          key: `term-${term.id}`,
          id: term.id,
          kind: 'term' as const,
          name: term.name,
          startDate: toDateInput(term.startDate),
          endDate: toDateInput(term.endDate),
          childrenLoaded: true,
          children: (term.subjectGroups ?? []).map((group) => ({
            key: `group-${group.id}`,
            id: group.id,
            kind: 'group' as const,
            name: group.name,
            childrenLoaded: true,
            children: (group.subjects ?? []).map((subject) => ({
              key: `subject-${subject.id}`,
              id: subject.id,
              kind: 'subject' as const,
              name: subject.name,
              description: subject.description,
              status: subject.status,
              children: [],
              childrenLoaded: false,
            })),
          })),
        })),
      })),
    };
  }
}
