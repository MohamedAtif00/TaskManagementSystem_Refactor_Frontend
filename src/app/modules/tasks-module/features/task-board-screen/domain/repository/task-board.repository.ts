import { Observable } from 'rxjs';
import {
  AssignTaskPayload,
  ChangePriorityPayload,
  CreateTaskPayload,
  JumpPoint,
  JumpTaskPayload,
  TaskActivity,
  TaskBoardEntity,
  TaskBoardPageEntity,
  TaskBoardPageParams,
  TaskBoardParams,
  TaskCardEntity,
  TaskColumnPageEntity,
  TaskColumnPageParams,
  TaskComment,
  TaskDetailsEntity,
  TaskWorkTime,
} from '../entity/task-board.entity';

export abstract class TaskBoardRepository {
  abstract getBoard(params: TaskBoardParams): Observable<TaskBoardEntity>;
  abstract getBoardPage(params: TaskBoardPageParams): Observable<TaskBoardPageEntity>;
  abstract getColumnPage(params: TaskColumnPageParams): Observable<TaskColumnPageEntity>;
  abstract getTask(id: number): Observable<TaskDetailsEntity>;
  abstract proceed(id: number): Observable<TaskCardEntity>;
  abstract complete(id: number): Observable<TaskCardEntity>;
  abstract assign(payload: AssignTaskPayload): Observable<TaskCardEntity>;
  abstract flag(id: number): Observable<TaskCardEntity>;
  abstract rollback(id: number): Observable<TaskCardEntity>;
  abstract skip(id: number): Observable<TaskCardEntity>;
  abstract jump(payload: JumpTaskPayload): Observable<TaskCardEntity>;
  abstract changePriority(payload: ChangePriorityPayload): Observable<TaskCardEntity>;
  abstract listJumpPoints(ticketId: number): Observable<JumpPoint[]>;
  abstract listActivity(ticketId: number): Observable<TaskActivity[]>;
  abstract createTask(payload: CreateTaskPayload): Observable<TaskCardEntity>;
  abstract listTaskBank(): Observable<{ id: number; name: string }[]>;
  abstract listComments(ticketId: number): Observable<TaskComment[]>;
  abstract addComment(ticketId: number, content: string): Observable<TaskComment>;
  abstract startWork(ticketId: number): Observable<TaskWorkTime>;
  abstract stopWork(ticketId: number): Observable<TaskWorkTime>;
}
