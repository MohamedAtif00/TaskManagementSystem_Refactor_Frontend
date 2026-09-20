import { Injectable } from '@angular/core';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { mapApiPriority } from '@core/models/role-map';
import { API, apiPath } from '@core/network/api/api.const';
import { CurriculumCatalogService } from '@core/network/curriculum-catalog.service';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { DirectoryUser, UserDirectoryService } from '@core/network/user-directory.service';
import {
  AssignTaskPayload,
  CreateTaskPayload,
  TaskBoardParams,
  TaskComment,
  TaskStatus,
  TaskWorkTime,
} from '../../../domain/entity/task-board.entity';
import { TaskBoardModel, TaskCardModel, TaskDetailsModel } from '../../model/task-board.model';
import { TaskBoardRemoteDataSource } from './task-board-remote-datasource';

interface TicketDto {
  id: number;
  name: string;
  status: number;
  priority: number;
  createdAt: string;
  learningObjectiveId: number;
  userId?: number | null;
  pause?: boolean;
  attention?: boolean;
  flagged?: boolean;
  isRollback?: boolean;
  rollbackCount?: number;
}

interface SubjectDto {
  id: number;
  name: string;
}

interface SprintDto {
  id: number;
  name: string;
  learningObjectiveIds?: number[];
}

interface TaskBankDto {
  id: number;
  name: string;
}

interface CommentDto {
  id: number;
  content: string;
  createdAt: string;
  timestamp: string;
  userId: number;
  learningObjectiveId: number;
  taskId?: number | null;
}

interface WorkTimeDto {
  id: number;
  startDate: string;
  endDate?: string | null;
  duration: number;
  taskId: number;
  userId: number;
}

@Injectable()
export class TaskBoardRemoteDataSourceImpl extends TaskBoardRemoteDataSource {
  constructor(
    private network: NetworkService,
    private catalog: CurriculumCatalogService,
    private users: UserDirectoryService,
  ) {
    super();
  }

  getBoard(params: TaskBoardParams): Observable<TaskBoardModel> {
    const tickets$ =
      params.source === 'sprint'
        ? this.network.get<TicketDto[]>(apiPath(API.Tickets.ListBySprint, { id: params.id }))
        : this.network.get<TicketDto[]>(apiPath(API.Tickets.ListBySubject, { id: params.id }));

    const meta$ =
      params.source === 'sprint'
        ? forkJoin({
            sprint: this.network.get<SprintDto>(apiPath(API.Sprints.ById, { id: params.id })),
            users: this.users.list(),
          }).pipe(
            map(({ sprint, users }) => ({
              name: sprint.name,
              learningObjectives: (sprint.learningObjectiveIds ?? []).map((id) => ({ id, name: `LO ${id}` })),
              users: users.map((user) => ({ id: user.id, name: user.name })),
            })),
          )
        : forkJoin({
            subject: this.network.get<SubjectDto>(apiPath(API.Curriculum.Subject, { id: params.id })),
            users: this.network.get<{ id: number; name: string }[]>(apiPath(API.Curriculum.SubjectUsers, { id: params.id })),
            los: this.catalog.getLosForSubject(params.id),
          }).pipe(
            map(({ subject, users, los }) => ({
              name: subject.name,
              learningObjectives: los.map((lo) => ({ id: lo.id, name: lo.name })),
              users,
            })),
          );

    return forkJoin({ tickets: tickets$, meta: meta$, directory: this.users.list() }).pipe(
      map(({ tickets, meta, directory }) => ({
        source: params.source,
        id: params.id,
        name: meta.name,
        cards: tickets.map((ticket) => this.toCard(ticket, meta.learningObjectives, directory)),
        learningObjectives: meta.learningObjectives,
        users: meta.users,
      })),
      catchError(mapHttpError),
    );
  }

  getTask(id: number): Observable<TaskDetailsModel> {
    return forkJoin({
      ticket: this.network.get<TicketDto>(apiPath(API.Tickets.ById, { id })),
      directory: this.users.list(),
    }).pipe(
      switchMap(({ ticket, directory }) =>
        this.network.get<{ id: number; name: string }>(apiPath(API.Curriculum.LearningObjective, { id: ticket.learningObjectiveId })).pipe(
          map((lo) => this.toDetails(ticket, { id: lo.id, name: lo.name }, directory)),
          catchError(() => of(this.toDetails(ticket, { id: ticket.learningObjectiveId, name: `LO ${ticket.learningObjectiveId}` }, directory))),
        ),
      ),
      catchError(mapHttpError),
    );
  }

  proceed(id: number): Observable<TaskCardModel> {
    return this.network.patch<TicketDto>(apiPath(API.Tickets.Proceed, { id })).pipe(
      switchMap((ticket) => this.cardFromTicket(ticket)),
      catchError(mapHttpError),
    );
  }

  complete(id: number): Observable<TaskCardModel> {
    return this.network.patch<TicketDto>(apiPath(API.Tickets.Complete, { id })).pipe(
      switchMap((ticket) => this.cardFromTicket(ticket)),
      catchError(mapHttpError),
    );
  }

  assign(payload: AssignTaskPayload): Observable<TaskCardModel> {
    return this.network.patch<TicketDto>(apiPath(API.Tickets.Assign, { id: payload.taskId }), { userId: payload.userId }).pipe(
      switchMap((ticket) => this.cardFromTicket(ticket)),
      catchError(mapHttpError),
    );
  }

  flag(_id: number): Observable<TaskCardModel> {
    return throwError(() => new Error('Flag is not available on the API yet'));
  }

  createTask(payload: CreateTaskPayload): Observable<TaskCardModel> {
    if (!payload.taskBankItemId) {
      return throwError(() => new Error('Task bank item is required'));
    }
    return this.network
      .post<TicketDto>(API.Tickets.Create, {
        learningObjectiveId: payload.learningObjectiveId,
        taskBankItemId: payload.taskBankItemId,
        userId: payload.userId,
      })
      .pipe(
        switchMap((ticket) => this.cardFromTicket(ticket)),
        catchError(mapHttpError),
      );
  }

  listTaskBank(): Observable<{ id: number; name: string }[]> {
    return this.network.get<TaskBankDto[]>(API.TaskBank.List).pipe(
      map((rows) => rows.map((row) => ({ id: row.id, name: row.name }))),
      catchError(mapHttpError),
    );
  }

  listComments(ticketId: number): Observable<TaskComment[]> {
    return forkJoin({
      comments: this.network.get<CommentDto[]>(apiPath(API.Tickets.Comments, { id: ticketId })),
      directory: this.users.list(),
    }).pipe(
      map(({ comments, directory }) => comments.map((row) => this.toComment(row, directory))),
      catchError(mapHttpError),
    );
  }

  addComment(ticketId: number, content: string): Observable<TaskComment> {
    return this.network.post<CommentDto>(apiPath(API.Tickets.Comments, { id: ticketId }), { content }).pipe(
      switchMap((row) =>
        this.users.list().pipe(map((directory) => this.toComment(row, directory))),
      ),
      catchError(mapHttpError),
    );
  }

  startWork(ticketId: number): Observable<TaskWorkTime> {
    return this.network.post<WorkTimeDto>(apiPath(API.Tickets.WorkTimeStart, { id: ticketId })).pipe(
      map((row) => this.toWorkTime(row)),
      catchError(mapHttpError),
    );
  }

  stopWork(ticketId: number): Observable<TaskWorkTime> {
    return this.network.post<WorkTimeDto>(apiPath(API.Tickets.WorkTimeStop, { id: ticketId })).pipe(
      map((row) => this.toWorkTime(row)),
      catchError(mapHttpError),
    );
  }

  private cardFromTicket(ticket: TicketDto): Observable<TaskCardModel> {
    return this.users.list().pipe(
      map((directory) =>
        this.toCard(ticket, [{ id: ticket.learningObjectiveId, name: `LO ${ticket.learningObjectiveId}` }], directory),
      ),
    );
  }

  private toCard(
    ticket: TicketDto,
    los: { id: number; name: string }[],
    directory: DirectoryUser[],
  ): TaskCardModel {
    const user = ticket.userId ? directory.find((row) => row.id === ticket.userId) : undefined;
    const lo = los.find((row) => row.id === ticket.learningObjectiveId);
    return {
      id: ticket.id,
      name: ticket.name,
      status: ticket.status as TaskStatus,
      priority: mapApiPriority(ticket.priority),
      user: user ? { id: user.id, name: user.name } : undefined,
      learningObjective: lo ?? { id: ticket.learningObjectiveId, name: `LO ${ticket.learningObjectiveId}` },
      flagged: !!ticket.flagged,
      paused: !!ticket.pause,
      isRollback: !!ticket.isRollback,
      rollbackCount: ticket.rollbackCount ?? 0,
    };
  }

  private toDetails(
    ticket: TicketDto,
    lo: { id: number; name: string },
    directory: DirectoryUser[],
  ): TaskDetailsModel {
    return {
      ...this.toCard(ticket, [lo], directory),
      subjectId: 0,
      subjectName: '',
      attention: !!ticket.attention,
      createdAt: ticket.createdAt,
      startedAt: null,
      doneAt: null,
    };
  }

  private toComment(row: CommentDto, directory: DirectoryUser[]): TaskComment {
    const user = directory.find((item) => item.id === row.userId);
    return {
      id: row.id,
      content: row.content,
      createdAt: row.createdAt || row.timestamp,
      userId: row.userId,
      userName: user?.name ?? `User ${row.userId}`,
    };
  }

  private toWorkTime(row: WorkTimeDto): TaskWorkTime {
    return {
      id: row.id,
      startDate: row.startDate,
      endDate: row.endDate ?? null,
      duration: row.duration,
      running: row.endDate == null,
    };
  }
}
