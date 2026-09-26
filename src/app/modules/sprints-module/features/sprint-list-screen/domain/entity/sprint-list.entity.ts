import { DEFAULT_PAGE_SIZE, ListPageResponse } from '@core/models/list-page.model';

export interface SprintLoEntity {
  id: number;
  name: string;
}

export interface SprintEntity {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isArchived: boolean;
  loNumber: number;
  progressPercent: number;
  learningObjects: SprintLoEntity[];
}

export interface SprintListParams {
  archived: boolean;
  page: number;
  pageSize: number;
}

export type SprintListPageEntity = ListPageResponse<SprintEntity>;

export const SPRINT_LIST_PAGE_SIZE = DEFAULT_PAGE_SIZE;

export interface SprintFormPayload {
  id?: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  learningObjectIds: number[];
  previousLearningObjectIds?: number[];
}

export interface SprintSubjectOption {
  id: number;
  name: string;
}

export interface SprintLoOption {
  id: number;
  name: string;
  unitName: string;
  lessonName: string;
}
