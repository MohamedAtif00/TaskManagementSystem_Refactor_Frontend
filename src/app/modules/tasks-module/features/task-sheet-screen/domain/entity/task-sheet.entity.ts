export type TaskStatus = 0 | 1 | 2 | 3 | 4;

export interface SheetTaskEntity {
  id: number;
  name: string;
  status: TaskStatus;
  user?: { id: number; name: string };
  flagged: boolean;
  paused: boolean;
  isRollback: boolean;
}

export interface SheetLoEntity {
  id: number;
  name: string;
  tag: string;
  template: string;
  environment: string;
  schemaName: string;
  tasks: SheetTaskEntity[];
}

export interface SheetLessonEntity {
  id: number;
  name: string;
  learningObjectives: SheetLoEntity[];
}

export interface SheetUnitEntity {
  id: number;
  name: string;
  lessons: SheetLessonEntity[];
}

export interface TaskSheetEntity {
  id: number;
  name: string;
  units: SheetUnitEntity[];
  users: { id: number; name: string }[];
}
