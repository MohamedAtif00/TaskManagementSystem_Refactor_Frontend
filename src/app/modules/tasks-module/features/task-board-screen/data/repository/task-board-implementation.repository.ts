import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { UserRole } from '@core/models/user-role';
import { AuthService } from '@core/services/auth.service';
import {
  AssignTaskPayload,
  CreateTaskPayload,
  TaskAccess,
  TaskBoardEntity,
  TaskBoardParams,
  TaskCardEntity,
  TaskComment,
  TaskDetailsEntity,
  TaskWorkTime,
} from '../../domain/entity/task-board.entity';
import { TaskBoardRepository } from '../../domain/repository/task-board.repository';
import { TaskBoardLocalDataSource } from '../data_source/local/task-board-local-datasource';
import { TaskBoardRemoteDataSource } from '../data_source/remote/task-board-remote-datasource';
import { TaskBoardMapper } from '../model/task-board.model';

@Injectable()
export class TaskBoardImplementationRepository implements TaskBoardRepository {
  constructor(
    private local: TaskBoardLocalDataSource,
    private remote: TaskBoardRemoteDataSource,
    private auth: AuthService,
  ) {}

  getBoard(params: TaskBoardParams): Observable<TaskBoardEntity> {
    const source = environment.useMock ? this.local.getBoard(params) : this.remote.getBoard(params);
    return source.pipe(map((row) => TaskBoardMapper.toBoard(row)));
  }

  getTask(id: number): Observable<TaskDetailsEntity> {
    const source = environment.useMock ? this.local.getTask(id) : this.remote.getTask(id);
    return source.pipe(
      map((row) =>
        TaskBoardMapper.toDetails({
          ...row,
          access: this.accessFor(row.user?.id),
        }),
      ),
    );
  }

  proceed(id: number): Observable<TaskCardEntity> {
    const source = environment.useMock ? this.local.proceed(id) : this.remote.proceed(id);
    return source.pipe(map((row) => TaskBoardMapper.toCard(row)));
  }

  complete(id: number): Observable<TaskCardEntity> {
    const source = environment.useMock ? this.local.complete(id) : this.remote.complete(id);
    return source.pipe(map((row) => TaskBoardMapper.toCard(row)));
  }

  assign(payload: AssignTaskPayload): Observable<TaskCardEntity> {
    const source = environment.useMock ? this.local.assign(payload) : this.remote.assign(payload);
    return source.pipe(map((row) => TaskBoardMapper.toCard(row)));
  }

  flag(id: number): Observable<TaskCardEntity> {
    const source = environment.useMock ? this.local.flag(id) : this.remote.flag(id);
    return source.pipe(map((row) => TaskBoardMapper.toCard(row)));
  }

  createTask(payload: CreateTaskPayload): Observable<TaskCardEntity> {
    const source = environment.useMock ? this.local.createTask(payload) : this.remote.createTask(payload);
    return source.pipe(map((row) => TaskBoardMapper.toCard(row)));
  }

  listTaskBank(): Observable<{ id: number; name: string }[]> {
    return environment.useMock ? this.local.listTaskBank() : this.remote.listTaskBank();
  }

  listComments(ticketId: number): Observable<TaskComment[]> {
    return environment.useMock ? this.local.listComments(ticketId) : this.remote.listComments(ticketId);
  }

  addComment(ticketId: number, content: string): Observable<TaskComment> {
    return environment.useMock ? this.local.addComment(ticketId, content) : this.remote.addComment(ticketId, content);
  }

  startWork(ticketId: number): Observable<TaskWorkTime> {
    return environment.useMock ? this.local.startWork(ticketId) : this.remote.startWork(ticketId);
  }

  stopWork(ticketId: number): Observable<TaskWorkTime> {
    return environment.useMock ? this.local.stopWork(ticketId) : this.remote.stopWork(ticketId);
  }

  private accessFor(assigneeId?: number): TaskAccess {
    const user = this.auth.user();
    if (!user) {
      return 'None';
    }
    const canWork = assigneeId === user.id;
    const canManage = user.role !== UserRole.Member;
    if (canWork && canManage) {
      return 'WorkOnAndManage';
    }
    if (canWork) {
      return 'WorkOn';
    }
    if (canManage) {
      return 'Manage';
    }
    return 'None';
  }
}
