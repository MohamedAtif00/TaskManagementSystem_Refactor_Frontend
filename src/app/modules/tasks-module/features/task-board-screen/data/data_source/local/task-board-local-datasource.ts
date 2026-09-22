import { Observable } from 'rxjs';
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
  TaskWorkTime,
} from '../../../domain/entity/task-board.entity';
import {
  TaskBoardModel,
  TaskBoardPageModel,
  TaskCardModel,
  TaskColumnPageModel,
  TaskDetailsModel,
} from '../../model/task-board.model';

export abstract class TaskBoardLocalDataSource {
  abstract getBoard(params: TaskBoardParams): Observable<TaskBoardModel>;
  abstract getBoardPage(params: TaskBoardPageParams): Observable<TaskBoardPageModel>;
  abstract getColumnPage(params: TaskColumnPageParams): Observable<TaskColumnPageModel>;
  abstract getTask(id: number): Observable<TaskDetailsModel>;
  abstract proceed(id: number): Observable<TaskCardModel>;
  abstract complete(id: number): Observable<TaskCardModel>;
  abstract assign(payload: AssignTaskPayload): Observable<TaskCardModel>;
  abstract flag(id: number): Observable<TaskCardModel>;
  abstract pause(id: number): Observable<TaskCardModel>;
  abstract rollback(id: number): Observable<TaskCardModel>;
  abstract skip(id: number): Observable<TaskCardModel>;
  abstract jump(payload: JumpTaskPayload): Observable<TaskCardModel>;
  abstract changePriority(payload: ChangePriorityPayload): Observable<TaskCardModel>;
  abstract listJumpPoints(ticketId: number): Observable<JumpPoint[]>;
  abstract listActivity(ticketId: number): Observable<TaskActivity[]>;
  abstract createTask(payload: CreateTaskPayload): Observable<TaskCardModel>;
  abstract listTaskBank(): Observable<{ id: number; name: string }[]>;
  abstract listComments(ticketId: number): Observable<TaskComment[]>;
  abstract addComment(ticketId: number, content: string): Observable<TaskComment>;
  abstract updateComment(payload: { ticketId: number; commentId: number; content: string }): Observable<TaskComment>;
  abstract deleteComment(payload: { ticketId: number; commentId: number }): Observable<void>;
  abstract startWork(ticketId: number): Observable<TaskWorkTime>;
  abstract stopWork(ticketId: number): Observable<TaskWorkTime>;
}
