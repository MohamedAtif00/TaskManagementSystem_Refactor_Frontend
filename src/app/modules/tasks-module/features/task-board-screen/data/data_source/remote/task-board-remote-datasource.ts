import { Observable } from 'rxjs';
import {
  AssignTaskPayload,
  CreateTaskPayload,
  TaskBoardParams,
  TaskComment,
  TaskWorkTime,
} from '../../../domain/entity/task-board.entity';
import { TaskBoardModel, TaskCardModel, TaskDetailsModel } from '../../model/task-board.model';

export abstract class TaskBoardRemoteDataSource {
  abstract getBoard(params: TaskBoardParams): Observable<TaskBoardModel>;
  abstract getTask(id: number): Observable<TaskDetailsModel>;
  abstract proceed(id: number): Observable<TaskCardModel>;
  abstract complete(id: number): Observable<TaskCardModel>;
  abstract assign(payload: AssignTaskPayload): Observable<TaskCardModel>;
  abstract flag(id: number): Observable<TaskCardModel>;
  abstract createTask(payload: CreateTaskPayload): Observable<TaskCardModel>;
  abstract listTaskBank(): Observable<{ id: number; name: string }[]>;
  abstract listComments(ticketId: number): Observable<TaskComment[]>;
  abstract addComment(ticketId: number, content: string): Observable<TaskComment>;
  abstract startWork(ticketId: number): Observable<TaskWorkTime>;
  abstract stopWork(ticketId: number): Observable<TaskWorkTime>;
}
