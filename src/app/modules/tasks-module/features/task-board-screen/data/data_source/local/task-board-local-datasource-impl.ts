import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TmsMockStore } from '@core/mock/tms-mock.store';
import { AuthService } from '@core/services/auth.service';
import {
  AssignTaskPayload,
  CreateTaskPayload,
  TaskBoardParams,
  TaskComment,
  TaskWorkTime,
} from '../../../domain/entity/task-board.entity';
import { TaskBoardModel, TaskCardModel, TaskDetailsModel } from '../../model/task-board.model';
import { TaskBoardLocalDataSource } from './task-board-local-datasource';

@Injectable()
export class TaskBoardLocalDataSourceImpl extends TaskBoardLocalDataSource {
  private readonly comments = new Map<number, TaskComment[]>();
  private readonly openTimers = new Map<number, TaskWorkTime>();
  private nextCommentId = 1;
  private nextWorkId = 1;

  constructor(
    private store: TmsMockStore,
    private auth: AuthService,
  ) {
    super();
  }

  getBoard(params: TaskBoardParams): Observable<TaskBoardModel> {
    const name =
      params.source === 'project'
        ? this.store.getSubject(params.id)?.name
        : this.store.getSprint(params.id)?.name;
    if (!name) {
      return throwError(() => new Error('Board not found'));
    }
    const cards = this.store.cardsFor(params.source, params.id).map((task) => this.toCard(task));
    const sprint = params.source === 'sprint' ? this.store.getSprint(params.id) : undefined;
    const learningObjectives =
      params.source === 'project'
        ? this.store.losForSubject(params.id).map((lo) => ({ id: lo.id, name: lo.name }))
        : this.store.learningObjectives
            .filter((lo) => sprint?.learningObjectIds.includes(lo.id))
            .map((lo) => ({ id: lo.id, name: lo.name }));
    return of({
      source: params.source,
      id: params.id,
      name,
      cards,
      learningObjectives,
      users: this.store.users.map((user) => ({ id: user.id, name: user.name })),
    }).pipe(delay(120));
  }

  getTask(id: number): Observable<TaskDetailsModel> {
    const task = this.store.getTask(id);
    if (!task) {
      return throwError(() => new Error('Task not found'));
    }
    const subject = this.store.getSubject(task.subjectId);
    return of({
      ...this.toCard(task),
      subjectId: task.subjectId,
      subjectName: subject?.name ?? 'Unknown',
      attention: task.attention,
      createdAt: task.createdAt,
      startedAt: task.startedAt,
      doneAt: task.doneAt,
    }).pipe(delay(80));
  }

  proceed(id: number): Observable<TaskCardModel> {
    const task = this.store.proceed(id);
    return task ? of(this.toCard(task)).pipe(delay(80)) : throwError(() => new Error('Task not found'));
  }

  complete(id: number): Observable<TaskCardModel> {
    const task = this.store.complete(id);
    return task ? of(this.toCard(task)).pipe(delay(80)) : throwError(() => new Error('Task not found'));
  }

  assign(payload: AssignTaskPayload): Observable<TaskCardModel> {
    const task = this.store.assign(payload.taskId, payload.userId);
    return task ? of(this.toCard(task)).pipe(delay(80)) : throwError(() => new Error('Task not found'));
  }

  flag(id: number): Observable<TaskCardModel> {
    const task = this.store.flag(id);
    return task ? of(this.toCard(task)).pipe(delay(80)) : throwError(() => new Error('Task not found'));
  }

  createTask(payload: CreateTaskPayload): Observable<TaskCardModel> {
    return of(this.toCard(this.store.createTask(payload))).pipe(delay(80));
  }

  listTaskBank(): Observable<{ id: number; name: string }[]> {
    return of([{ id: 1, name: 'Default task' }]).pipe(delay(40));
  }

  listComments(ticketId: number): Observable<TaskComment[]> {
    return of([...(this.comments.get(ticketId) ?? [])]).pipe(delay(40));
  }

  addComment(ticketId: number, content: string): Observable<TaskComment> {
    const trimmed = content.trim();
    if (!trimmed) {
      return throwError(() => new Error('Comment content is required'));
    }
    const user = this.auth.user();
    const comment: TaskComment = {
      id: this.nextCommentId++,
      content: trimmed,
      createdAt: new Date().toISOString(),
      userId: user?.id ?? 0,
      userName: user?.name ?? 'You',
    };
    const list = this.comments.get(ticketId) ?? [];
    list.push(comment);
    this.comments.set(ticketId, list);
    return of(comment).pipe(delay(40));
  }

  startWork(ticketId: number): Observable<TaskWorkTime> {
    if (this.openTimers.has(ticketId)) {
      return throwError(() => new Error('An open work time already exists for this user on this ticket.'));
    }
    const work: TaskWorkTime = {
      id: this.nextWorkId++,
      startDate: new Date().toISOString(),
      endDate: null,
      duration: 0,
      running: true,
    };
    this.openTimers.set(ticketId, work);
    return of(work).pipe(delay(40));
  }

  stopWork(ticketId: number): Observable<TaskWorkTime> {
    const open = this.openTimers.get(ticketId);
    if (!open) {
      return throwError(() => new Error('Work time not found.'));
    }
    const end = new Date();
    const stopped: TaskWorkTime = {
      ...open,
      endDate: end.toISOString(),
      duration: (end.getTime() - new Date(open.startDate).getTime()) / 60_000,
      running: false,
    };
    this.openTimers.delete(ticketId);
    return of(stopped).pipe(delay(40));
  }

  private toCard(task: {
    id: number;
    name: string;
    status: TaskCardModel['status'];
    priority: TaskCardModel['priority'];
    user?: TaskCardModel['user'];
    learningObjective: TaskCardModel['learningObjective'];
    flagged: boolean;
    paused: boolean;
    isRollback: boolean;
    rollbackCount: number;
  }): TaskCardModel {
    return {
      id: task.id,
      name: task.name,
      status: task.status,
      priority: task.priority,
      user: task.user,
      learningObjective: task.learningObjective,
      flagged: task.flagged,
      paused: task.paused,
      isRollback: task.isRollback,
      rollbackCount: task.rollbackCount,
    };
  }
}
