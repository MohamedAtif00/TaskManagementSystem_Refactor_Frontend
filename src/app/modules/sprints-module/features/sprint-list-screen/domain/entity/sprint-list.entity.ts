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
}

export interface SprintFormPayload {
  id?: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  learningObjectIds: number[];
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
