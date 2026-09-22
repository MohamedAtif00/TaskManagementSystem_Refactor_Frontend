import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { mapApiPriority } from '@core/models/role-map';
import { TicketListPageResponse } from '@core/api/tms-contracts';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { DirectoryUser, UserDirectoryService } from '@core/network/user-directory.service';
import {
  AssignTaskPayload,
  ChangePriorityPayload,
  CreateTaskPayload,
  JumpPoint,
  JumpTaskPayload,
  TaskActivity,
  TaskBoardPageParams,
  TaskBoardParams,
  TaskColumnPageParams,
  TaskIdName,
  TaskComment,
  TaskStatus,
  TaskWorkTime,
} from '../../../domain/entity/task-board.entity';
import {
  TaskBoardModel,
  TaskBoardPageModel,
  TaskCardModel,
  TaskColumnPageModel,
  TaskDetailsModel,
} from '../../model/task-board.model';
import { TaskBoardRemoteDataSource } from './task-board-remote-datasource';

interface TicketDto {
  id: number;
  name: string;
  status: number;
  priority: number;
  createdAt: string;
  startedAt?: string | null;
  doneAt?: string | null;
  subjectId?: number;
  duration?: number;
  tl?: boolean;
  isReview?: boolean;
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

interface TaskActivityDto {
  id: number;
  type: number;
  message: string;
  createdAt: string;
  userId?: number | null;
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
    private users: UserDirectoryService,
  ) {
    super();
  }

  getBoard(params: TaskBoardParams): Observable<TaskBoardModel> {
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
          }).pipe(
            map(({ subject, users }) => ({
              name: subject.name,
              learningObjectives: [],
              users,
            })),
          );

    return meta$.pipe(
      map((meta) => ({
        source: params.source,
        id: params.id,
        name: meta.name,
        cards: [],
        learningObjectives: meta.learningObjectives,
        users: meta.users,
      })),
      catchError(mapHttpError),
    );
  }

  getBoardPage(params: TaskBoardPageParams): Observable<TaskBoardPageModel> {
    const path =
      params.source === 'sprint'
        ? apiPath(API.Tickets.ListBySprint, { id: params.id })
        : apiPath(API.Tickets.ListBySubject, { id: params.id });
    let httpParams = new HttpParams().set('page', String(params.page)).set('pageSize', String(params.pageSize));
    if (params.learningObjectiveId) {
      httpParams = httpParams.set('learningObjectiveId', String(params.learningObjectiveId));
    }
    if (params.name?.trim()) {
      httpParams = httpParams.set('name', params.name.trim());
    }

    const users = params.users ?? [];
    return this.network.get<TicketListPageResponse>(path, httpParams).pipe(
      map((page) => ({
        items: (page.items ?? []).map((ticket) => this.toCard(ticket, [], users)),
        page: page.page,
        pageSize: page.pageSize,
        totalCount: page.totalCount,
      })),
      catchError(mapHttpError),
    );
  }

  getColumnPage(params: TaskColumnPageParams): Observable<TaskColumnPageModel> {
    const path =
      params.source === 'sprint'
        ? apiPath(API.Tickets.ListBySprint, { id: params.id })
        : apiPath(API.Tickets.ListBySubject, { id: params.id });
    let httpParams = new HttpParams().set('page', String(params.page)).set('pageSize', String(params.pageSize));
    for (const status of params.statuses) {
      httpParams = httpParams.append('status', String(status));
    }
    if (params.learningObjectiveId) {
      httpParams = httpParams.set('learningObjectiveId', String(params.learningObjectiveId));
    }
    if (params.name?.trim()) {
      httpParams = httpParams.set('name', params.name.trim());
    }

    return this.network.get<TicketListPageResponse>(path, httpParams).pipe(
      map((page) => ({
        items: (page.items ?? []).map((ticket) => this.toCard(ticket, [], [])),
        page: page.page,
        pageSize: page.pageSize,
        totalCount: page.totalCount,
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

  flag(id: number): Observable<TaskCardModel> {
    return this.network.patch<TicketDto>(apiPath(API.Tickets.Flag, { id })).pipe(
      switchMap((ticket) => this.cardFromTicket(ticket)),
      catchError(mapHttpError),
    );
  }

  rollback(id: number): Observable<TaskCardModel> {
    return this.network.patch<TicketDto>(apiPath(API.Tickets.Rollback, { id })).pipe(
      switchMap((ticket) => this.cardFromTicket(ticket)),
      catchError(mapHttpError),
    );
  }

  skip(id: number): Observable<TaskCardModel> {
    return this.network.patch<TicketDto>(apiPath(API.Tickets.Skip, { id })).pipe(
      switchMap((ticket) => this.cardFromTicket(ticket)),
      catchError(mapHttpError),
    );
  }

  jump(payload: JumpTaskPayload): Observable<TaskCardModel> {
    return this.network.patch<TicketDto>(apiPath(API.Tickets.Jump, { id: payload.taskId }), { stepId: payload.stepId }).pipe(
      switchMap((ticket) => this.cardFromTicket(ticket)),
      catchError(mapHttpError),
    );
  }

  changePriority(payload: ChangePriorityPayload): Observable<TaskCardModel> {
    return this.network
      .patch<TicketDto>(apiPath(API.Tickets.Priority, { id: payload.taskId }), { priority: payload.priority })
      .pipe(
        switchMap((ticket) => this.cardFromTicket(ticket)),
        catchError(mapHttpError),
      );
  }

  listJumpPoints(ticketId: number): Observable<JumpPoint[]> {
    return this.network.get<unknown>(apiPath(API.Tickets.JumpPoints, { id: ticketId })).pipe(
      map((response) => this.normalizeJumpPoints(response)),
      catchError(mapHttpError),
    );
  }

  listActivity(ticketId: number): Observable<TaskActivity[]> {
    return this.network.get<TaskActivityDto[]>(apiPath(API.Tickets.Activity, { id: ticketId })).pipe(
      switchMap((rows) =>
        this.users.list().pipe(
          map((directory) =>
            rows.map((row) => ({
              id: row.id,
              type: row.type,
              message: row.message,
              createdAt: row.createdAt,
              userId: row.userId,
              userName: row.userId ? directory.find((user) => user.id === row.userId)?.name : undefined,
            })),
          ),
        ),
      ),
      catchError(mapHttpError),
    );
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
    users: TaskIdName[] | DirectoryUser[],
  ): TaskCardModel {
    const user = ticket.userId ? users.find((row) => row.id === ticket.userId) : undefined;
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
      subjectId: ticket.subjectId ?? 0,
      subjectName: '',
      attention: !!ticket.attention,
      duration: ticket.duration ?? 0,
      tl: !!ticket.tl,
      isReview: !!ticket.isReview,
      createdAt: ticket.createdAt,
      startedAt: ticket.startedAt ?? null,
      doneAt: ticket.doneAt ?? null,
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

  private normalizeJumpPoints(response: unknown): JumpPoint[] {
    const rows = Array.isArray(response)
      ? response
      : response && typeof response === 'object' && Array.isArray((response as { items?: unknown[] }).items)
        ? (response as { items: unknown[] }).items
        : [];

    return rows
      .map((row) => this.toJumpPoint(row))
      .filter((point) => point.stepId > 0);
  }

  private toJumpPoint(row: unknown): JumpPoint {
    const record = row as Record<string, unknown>;
    return {
      stepId: Number(record['stepId'] ?? record['StepId'] ?? 0),
      nodeId: Number(record['nodeId'] ?? record['NodeId'] ?? 0),
      label: String(record['label'] ?? record['Label'] ?? '').trim(),
    };
  }
}
