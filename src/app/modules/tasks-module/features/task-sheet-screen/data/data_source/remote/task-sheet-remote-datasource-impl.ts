import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API, apiPath } from '@core/network/api/api.const';
import { CurriculumCatalogService } from '@core/network/curriculum-catalog.service';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { UserDirectoryService } from '@core/network/user-directory.service';
import { TaskSheetModel } from '../../model/task-sheet.model';
import { TaskSheetRemoteDataSource } from './task-sheet-remote-datasource';

interface TicketDto {
  id: number;
  name: string;
  status: number;
  learningObjectiveId: number;
  userId?: number | null;
  flagged?: boolean;
  pause?: boolean;
  isRollback?: boolean;
}

interface SubjectDto {
  id: number;
  name: string;
}

@Injectable()
export class TaskSheetRemoteDataSourceImpl extends TaskSheetRemoteDataSource {
  constructor(
    private network: NetworkService,
    private catalog: CurriculumCatalogService,
    private users: UserDirectoryService,
  ) {
    super();
  }

  getSheet(projectId: number): Observable<TaskSheetModel> {
    return forkJoin({
      subject: this.network.get<SubjectDto>(apiPath(API.Curriculum.Subject, { id: projectId })),
      sheet: this.catalog.getSubjectSheet(projectId),
      tickets: this.network.get<TicketDto[]>(apiPath(API.Tickets.ListBySubject, { id: projectId })),
      directory: this.users.list(),
      assigned: this.network.get<{ id: number; name: string }[]>(apiPath(API.Curriculum.SubjectUsers, { id: projectId })).pipe(
        catchError(() => of([] as { id: number; name: string }[])),
      ),
    }).pipe(
      map(({ subject, sheet, tickets, directory, assigned }) => ({
        id: subject.id,
        name: subject.name,
        users: assigned.length ? assigned : directory.map((user) => ({ id: user.id, name: user.name })),
        units: sheet.units.map((unit) => ({
          id: unit.id,
          name: unit.name,
          lessons: unit.lessons.map((lesson) => ({
            id: lesson.id,
            name: lesson.name,
            learningObjectives: lesson.learningObjectives.map((lo) => ({
              id: lo.id,
              name: lo.name,
              tag: lo.tag ?? '',
              template: lo.template ?? '',
              environment: lo.environment ?? '',
              schemaName: '',
              tasks: tickets
                .filter((ticket) => ticket.learningObjectiveId === lo.id)
                .map((ticket) => {
                  const user = ticket.userId ? directory.find((row) => row.id === ticket.userId) : undefined;
                  return {
                    id: ticket.id,
                    name: ticket.name,
                    status: ticket.status as 0 | 1 | 2 | 3 | 4,
                    user: user ? { id: user.id, name: user.name } : undefined,
                    flagged: !!ticket.flagged,
                    paused: !!ticket.pause,
                    isRollback: !!ticket.isRollback,
                  };
                }),
            })),
          })),
        })),
      })),
      catchError(mapHttpError),
    );
  }
}
