import { AssignmentLink } from '../board-assignment-scope';

export type TaskStatus = 0 | 1 | 2 | 3 | 4;
export type TaskPriority = 0 | 1 | 2 | 3;
export type TaskAccess = 'WorkOn' | 'Manage' | 'WorkOnAndManage' | 'None';
export type BoardSource = 'project' | 'sprint';

export interface TaskIdName {
  id: number;
  name: string;
  teamId?: number | null;
}

export interface TaskCardEntity {
  id: number;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  user?: TaskIdName;
  teamId?: number | null;
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
  assignmentLinks: AssignmentLink[] | null;
}

export interface TaskDetailsEntity extends TaskCardEntity {
  teamId: number | null;
  subjectId: number;
  subjectName: string;
  attention: boolean;
  duration: number;
  tl?: boolean;
  isReview?: boolean;
  createdAt: string;
  startedAt: string | null;
  doneAt: string | null;
  access: TaskAccess;
}

export interface TaskActivity {
  id: number;
  type: number;
  message: string;
  createdAt: string;
  userId?: number | null;
  userName?: string;
}

export interface JumpPoint {
  stepId: number;
  nodeId: number;
  label: string;
}

export interface ChangePriorityPayload {
  taskId: number;
  priority: TaskPriority;
}

export interface JumpTaskPayload {
  taskId: number;
  stepIds: number[];
}

export interface RollbackTaskPayload {
  taskId: number;
  stepId: number;
  clarification: string;
  issueNotes: string;
}

export interface TaskBoardParams {
  source: BoardSource;
  id: number;
}

export interface TaskBoardFilters {
  query: string;
  assignedToMe: boolean;
  userIds: number[];
  unassigned: boolean;
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  learningObjectiveIds: number[];
  flagged: boolean;
  paused: boolean;
  rolledBack: boolean;
}

export interface SavedBoardView {
  id: string;
  name: string;
  filters: TaskBoardFilters;
}

export function emptyTaskBoardFilters(): TaskBoardFilters {
  return {
    query: '',
    assignedToMe: false,
    userIds: [],
    unassigned: false,
    statuses: [],
    priorities: [],
    learningObjectiveIds: [],
    flagged: false,
    paused: false,
    rolledBack: false,
  };
}

export function taskBoardFiltersActive(filters: TaskBoardFilters): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.assignedToMe ||
    filters.userIds.length > 0 ||
    filters.unassigned ||
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.learningObjectiveIds.length > 0 ||
    filters.flagged ||
    filters.paused ||
    filters.rolledBack
  );
}

export interface TaskColumnPageParams {
  source: BoardSource;
  id: number;
  statuses: TaskStatus[];
  page: number;
  pageSize: number;
  filters: TaskBoardFilters;
  assigneeIds: number[];
  learningObjectiveId?: number;
  name?: string;
  users?: TaskIdName[];
}

export interface TaskColumnPageEntity {
  items: TaskCardEntity[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface TaskBoardPageParams {
  source: BoardSource;
  id: number;
  page: number;
  pageSize: number;
  learningObjectiveId?: number;
  name?: string;
  users?: TaskIdName[];
}

export interface TaskBoardPageEntity {
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
