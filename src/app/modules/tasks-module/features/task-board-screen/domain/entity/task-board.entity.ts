export type TaskStatus = 0 | 1 | 2 | 3 | 4;
export type TaskPriority = 0 | 1 | 2 | 3;
export type TaskAccess = 'WorkOn' | 'Manage' | 'WorkOnAndManage' | 'None';
export type BoardSource = 'project' | 'sprint';

export interface TaskIdName {
  id: number;
  name: string;
}

export interface TaskCardEntity {
  id: number;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  user?: TaskIdName;
  learningObjective: TaskIdName;
  flagged: boolean;
  paused: boolean;
  isRollback: boolean;
  rollbackCount: number;
}

export interface TaskBoardEntity {
  source: BoardSource;
  id: number;
  name: string;
  cards: TaskCardEntity[];
  learningObjectives: TaskIdName[];
  users: TaskIdName[];
}

export interface TaskDetailsEntity extends TaskCardEntity {
  subjectId: number;
  subjectName: string;
  attention: boolean;
  createdAt: string;
  startedAt: string | null;
  doneAt: string | null;
  access: TaskAccess;
}

export interface TaskBoardParams {
  source: BoardSource;
  id: number;
}

export interface TaskColumnPageParams {
  source: BoardSource;
  id: number;
  statuses: TaskStatus[];
  page: number;
  pageSize: number;
  learningObjectiveId?: number;
  name?: string;
}

export interface TaskColumnPageEntity {
  items: TaskCardEntity[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface CreateTaskPayload {
  subjectId: number;
  name: string;
  learningObjectiveId: number;
  userId?: number;
  taskBankItemId?: number;
}

export interface AssignTaskPayload {
  taskId: number;
  userId: number;
}

export interface TaskComment {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  userName: string;
}

export interface TaskWorkTime {
  id: number;
  startDate: string;
  endDate: string | null;
  duration: number;
  running: boolean;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  0: 'Backlog',
  1: 'To Do',
  2: 'Doing',
  3: 'Done',
  4: 'Rollback',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  0: 'None',
  1: 'Low',
  2: 'Medium',
  3: 'High',
};
