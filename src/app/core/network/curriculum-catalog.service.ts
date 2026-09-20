import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SUBJECT_STATUS_LABELS } from '@core/models/role-map';
import { API, apiPath } from './api/api.const';
import { mapHttpError } from './http-error';
import { NetworkService } from './network.service';

export interface YearTreeSubject {
  id: number;
  name: string;
  description: string;
  status: number;
}

export interface YearTreeGroup {
  id: number;
  name: string;
  subjects: YearTreeSubject[];
}

export interface YearTreeTerm {
  id: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  subjectGroups: YearTreeGroup[];
}

export interface YearTreeProject {
  id: number;
  name: string;
  description?: string;
  terms: YearTreeTerm[];
}

export interface YearTree {
  id: number;
  name: string;
  description?: string;
  projects: YearTreeProject[];
}

export interface FlatProject {
  id: number;
  name: string;
  description: string;
  status: string;
  subjectCount: number;
  year: string;
}

export interface FlatSubject {
  id: number;
  name: string;
  folderPath: string;
  year: string;
  term: string;
  status: string;
  progressPercent: number;
}

export interface UnitItem {
  id: number;
  name: string;
}

export interface LessonItem {
  id: number;
  name: string;
  unitId: number;
}

export interface LoItem {
  id: number;
  name: string;
  tag: string;
  template: string;
  environment: string;
  lessonId: number;
}

@Injectable({ providedIn: 'root' })
export class CurriculumCatalogService {
  constructor(private network: NetworkService) {}

  getTrees(): Observable<YearTree[]> {
    return this.network.get<{ id: number; name: string }[]>(API.Curriculum.Years).pipe(
      switchMap((years) => {
        if (!years.length) {
          return of([] as YearTree[]);
        }
        return forkJoin(
          years.map((year) =>
            this.network.get<YearTree>(apiPath(API.Curriculum.YearTree, { id: year.id })).pipe(
              map((tree) => ({ ...tree, name: tree.name || year.name })),
            ),
          ),
        );
      }),
      catchError(mapHttpError),
    );
  }

  flattenProjects(trees: YearTree[]): FlatProject[] {
    const rows: FlatProject[] = [];
    for (const year of trees) {
      for (const project of year.projects ?? []) {
        const subjects = this.collectSubjects(project);
        rows.push({
          id: project.id,
          name: project.name,
          description: project.description ?? '',
          status: SUBJECT_STATUS_LABELS[subjects[0]?.status ?? 0] ?? 'Active',
          subjectCount: subjects.length,
          year: year.name,
        });
      }
    }
    return rows;
  }

  flattenSubjects(trees: YearTree[]): FlatSubject[] {
    const rows: FlatSubject[] = [];
    for (const year of trees) {
      for (const project of year.projects ?? []) {
        for (const term of project.terms ?? []) {
          for (const group of term.subjectGroups ?? []) {
            for (const subject of group.subjects ?? []) {
              rows.push({
                id: subject.id,
                name: subject.name,
                folderPath: `${year.name} / ${term.name} / ${group.name}`,
                year: year.name,
                term: term.name,
                status: SUBJECT_STATUS_LABELS[subject.status] ?? 'Active',
                progressPercent: 0,
              });
            }
          }
        }
      }
    }
    return rows;
  }

  getSubjectUnits(subjectId: number): Observable<UnitItem[]> {
    return this.network
      .get<UnitItem[]>(apiPath(API.Curriculum.SubjectUnits, { subjectId }))
      .pipe(catchError(mapHttpError));
  }

  getUnitLessons(unitId: number): Observable<LessonItem[]> {
    return this.network
      .get<LessonItem[]>(apiPath(API.Curriculum.UnitLessons, { unitId }))
      .pipe(catchError(mapHttpError));
  }

  getLessonLos(lessonId: number): Observable<LoItem[]> {
    return this.network
      .get<LoItem[]>(apiPath(API.Curriculum.LessonLos, { lessonId }))
      .pipe(catchError(mapHttpError));
  }

  getSubjectSheet(subjectId: number): Observable<{
    units: { id: number; name: string; lessons: { id: number; name: string; learningObjectives: LoItem[] }[] }[];
  }> {
    return this.getSubjectUnits(subjectId).pipe(
      switchMap((units) => {
        if (!units.length) {
          return of({ units: [] });
        }
        return forkJoin(
          units.map((unit) =>
            this.getUnitLessons(unit.id).pipe(
              switchMap((lessons) => {
                if (!lessons.length) {
                  return of({ ...unit, lessons: [] as { id: number; name: string; learningObjectives: LoItem[] }[] });
                }
                return forkJoin(
                  lessons.map((lesson) =>
                    this.getLessonLos(lesson.id).pipe(
                      map((los) => ({ id: lesson.id, name: lesson.name, learningObjectives: los })),
                    ),
                  ),
                ).pipe(map((lessonRows) => ({ id: unit.id, name: unit.name, lessons: lessonRows })));
              }),
            ),
          ),
        ).pipe(map((unitRows) => ({ units: unitRows })));
      }),
    );
  }

  getLosForSubject(subjectId: number): Observable<{ id: number; name: string; unitName: string; lessonName: string }[]> {
    return this.getSubjectSheet(subjectId).pipe(
      map((sheet) =>
        sheet.units.flatMap((unit) =>
          unit.lessons.flatMap((lesson) =>
            lesson.learningObjectives.map((lo) => ({
              id: lo.id,
              name: lo.name,
              unitName: unit.name,
              lessonName: lesson.name,
            })),
          ),
        ),
      ),
    );
  }

  private collectSubjects(project: YearTreeProject): YearTreeSubject[] {
    return (project.terms ?? []).flatMap((term) =>
      (term.subjectGroups ?? []).flatMap((group) => group.subjects ?? []),
    );
  }
}
