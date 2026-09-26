import { DEFAULT_PAGE_SIZE, ListPageResponse } from '@core/models/list-page.model';

export interface TaskSubjectEntity {
  id: number;
  name: string;
  folderPath: string;
  year: string;
  term: string;
  status: string;
  progressPercent: number;
}

export interface TaskListParams {
  search: string;
  year: string;
  term: string;
  page: number;
  pageSize: number;
}

export interface TaskFilterOptions {
  years: string[];
  terms: string[];
}

export type TaskListPageEntity = ListPageResponse<TaskSubjectEntity>;

export const TASK_LIST_PAGE_SIZE = DEFAULT_PAGE_SIZE;
