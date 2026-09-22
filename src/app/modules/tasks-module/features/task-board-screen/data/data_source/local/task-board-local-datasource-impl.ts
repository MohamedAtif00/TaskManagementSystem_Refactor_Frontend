import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TmsMockStore } from '@core/mock/tms-mock.store';
import { AuthService } from '@core/services/auth.service';
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
  TaskComment,
  TaskPriority,
  TaskWorkTime,
} from '../../../domain/entity/task-board.entity';
import {
  TaskBoardModel,
  TaskBoardPageModel,
  TaskCardModel,
  TaskColumnPageModel,
  TaskDetailsModel,
} from '../../model/task-board.model';
import { TaskBoardLocalDataSource } from './task-board-local-datasource';

@Injectable()
export class TaskBoardLocalDataSourceImpl extends TaskBoardLocalDataSource {
  private readonly comments = new Map<number, TaskComment[]>();
  private readonly activities = new Map<number, TaskActivity[]>();
  private readonly openTimers = new Map<number, TaskWorkTime>();
  private readonly priorityOverrides = new Map<number, TaskPriority>();
  private nextCommentId = 1;
  private nextWorkId = 1;
  private nextActivityId = 1;

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
    const sprint = params.source === 'sprint' ? this.store.getSprint(params.id) : undefined;
    const learningObjectives =
      params.source === 'project'
        ? []
        : this.store.learningObjectives
            .filter((lo) => sprint?.learningObjectIds.includes(lo.id))
            .map((lo) => ({ id: lo.id, name: lo.name }));
    return of({
      source: params.source,
      id: params.id,
      name,
      cards: [],
      learningObjectives,
      users: this.store.users.map((user) => ({ id: user.id, name: user.name })),
    }).pipe(delay(120));
  }

  getBoardPage(params: TaskBoardPageParams): Observable<TaskBoardPageModel> {
    let cards = this.store.cardsFor(params.source, params.id);
    if (params.learningObjectiveId) {
      cards = cards.filter((card) => card.learningObjective.id === params.learningObjectiveId);
    }
    const query = params.name?.trim().toLowerCase() ?? '';
    if (query) {
      cards = cards.filter((card) => card.name.toLowerCase().includes(query));
    }
    const start = Math.max(0, (params.page - 1) * params.pageSize);
    return of({
      items: cards.slice(start, start + params.pageSize).map((task) => this.toCard(task)),
      page: params.page,
      pageSize: params.pageSize,
      totalCount: cards.length,
    }).pipe(delay(80));
  }

  getColumnPage(params: TaskColumnPageParams): Observable<TaskColumnPageModel> {
    let cards = this.store.cardsFor(params.source, params.id);
    if (params.statuses.length) {
      cards = cards.filter((card) => params.statuses.includes(card.status));
    }
    if (params.learningObjectiveId) {
      cards = cards.filter((card) => card.learningObjective.id === params.learningObjectiveId);
    }
    const query = params.name?.trim().toLowerCase() ?? '';
    if (query) {
      cards = cards.filter((card) => card.name.toLowerCase().includes(query));
    }
    const start = Math.max(0, (params.page - 1) * params.pageSize);
    return of({
      items: cards.slice(start, start + params.pageSize).map((task) => this.toCard(task)),
      page: params.page,
      pageSize: params.pageSize,
      totalCount: cards.length,
    }).pipe(delay(80));
  }

  getTask(id: number): Observable<TaskDetailsModel> {
    const task = this.store.getTask(id);
    if (!task) {
      return throwError(() => new Error('Task not found'));
    }
    const subject = this.store.getSubject(task.subjectId);
    this.ensureCreatedActivity(task.id, task.name, task.createdAt);
    return of({
      ...this.toCard(task),
      subjectId: task.subjectId,
      subjectName: subject?.name ?? 'Unknown',
      attention: task.attention,
      duration: 60,
      tl: false,
      isReview: false,
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

  pause(id: number): Observable<TaskCardModel> {
    const task = this.store.togglePause(id);
    return task ? of(this.toCard(task)).pipe(delay(80)) : throwError(() => new Error('Task not found'));
  }

  rollback(id: number): Observable<TaskCardModel> {
    const task = this.store.rollback(id);
    if (!task) {
      return throwError(() => new Error('Task cannot be rolled back'));
    }
    this.pushActivity(task.id, 7, `${task.name} was rolled back.`);
    return of(this.toCard(task)).pipe(delay(80));
  }

  skip(id: number): Observable<TaskCardModel> {
    const task = this.store.complete(id);
    if (!task) {
      return throwError(() => new Error('Task not found'));
    }
    this.pushActivity(id, 10, `${task.name} was skipped.`);
    return of(this.toCard(task)).pipe(delay(80));
  }

  jump(payload: JumpTaskPayload): Observable<TaskCardModel> {
    const task = this.store.proceed(payload.taskId) ?? this.store.getTask(payload.taskId);
    if (!task) {
      return throwError(() => new Error('Task not found'));
    }
    this.pushActivity(payload.taskId, 11, `${task.name} jumped to step ${payload.stepId}.`);
    return of(this.toCard(task)).pipe(delay(80));
  }

  changePriority(payload: ChangePriorityPayload): Observable<TaskCardModel> {
    const task = this.store.getTask(payload.taskId);
    if (!task) {
      return throwError(() => new Error('Task not found'));
    }
    this.priorityOverrides.set(payload.taskId, payload.priority);
    this.pushActivity(payload.taskId, 9, `${task.name} priority changed.`);
    return of({ ...this.toCard(task), priority: payload.priority }).pipe(delay(80));
  }

  listJumpPoints(_ticketId: number): Observable<JumpPoint[]> {
    return of([
      { stepId: 2, nodeId: 1, label: 'Review step' },
      { stepId: 3, nodeId: 2, label: 'Final step' },
    ]).pipe(delay(40));
  }

  listActivity(ticketId: number): Observable<TaskActivity[]> {
    return of([...(this.activities.get(ticketId) ?? [])]).pipe(delay(40));
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
    this.pushActivity(ticketId, 8, `${user?.name ?? 'Someone'} added a comment.`, user?.id);
    return of(comment).pipe(delay(40));
  }

  updateComment(payload: { ticketId: number; commentId: number; content: string }): Observable<TaskComment> {
    const trimmed = payload.content.trim();
    if (!trimmed) {
      return throwError(() => new Error('Comment content is required'));
    }
    const list = this.comments.get(payload.ticketId) ?? [];
    const index = list.findIndex((row) => row.id === payload.commentId);
    if (index < 0) {
      return throwError(() => new Error('Comment not found'));
    }
    const user = this.auth.user();
    if (list[index].userId !== user?.id) {
      return throwError(() => new Error('You can only edit your own comments'));
    }
    const updated = { ...list[index], content: trimmed };
    list[index] = updated;
    this.comments.set(payload.ticketId, list);
    return of(updated).pipe(delay(40));
  }

  deleteComment(payload: { ticketId: number; commentId: number }): Observable<void> {
    const list = this.comments.get(payload.ticketId) ?? [];
    const index = list.findIndex((row) => row.id === payload.commentId);
    if (index < 0) {
      return throwError(() => new Error('Comment not found'));
    }
    const user = this.auth.user();
    if (list[index].userId !== user?.id) {
      return throwError(() => new Error('You can only delete your own comments'));
    }
    list.splice(index, 1);
    this.comments.set(payload.ticketId, list);
    return of(undefined).pipe(delay(40));
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

  private ensureCreatedActivity(taskId: number, name: string, createdAt: string): void {
    const list = this.activities.get(taskId) ?? [];
    if (list.some((entry) => entry.type === 1)) {
      return;
    }
    this.pushActivity(taskId, 1, `${name} was created.`, undefined, createdAt);
  }

  private pushActivity(
    taskId: number,
    type: number,
    message: string,
    userId?: number,
    createdAt = new Date().toISOString(),
  ): void {
    const list = this.activities.get(taskId) ?? [];
    list.unshift({
      id: this.nextActivityId++,
      type,
      message,
      createdAt,
      userId: userId ?? null,
      userName: userId ? this.store.users.find((user) => user.id === userId)?.name : undefined,
    });
    this.activities.set(taskId, list);
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
      priority: this.priorityOverrides.get(task.id) ?? task.priority,
      user: task.user,
      learningObjective: task.learningObjective,
      flagged: task.flagged,
      paused: task.paused,
      isRollback: task.isRollback,
      rollbackCount: task.rollbackCount,
    };
  }
}
