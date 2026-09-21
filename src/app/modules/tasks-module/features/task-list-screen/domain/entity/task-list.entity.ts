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
}

export interface TaskFilterOptions {
  years: string[];
  terms: string[];
}
