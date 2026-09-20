export type CurriculumKind = 'year' | 'project' | 'term' | 'group' | 'subject' | 'unit' | 'lesson' | 'lo';

export interface CurriculumNode {
  key: string;
  id: number;
  kind: CurriculumKind;
  name: string;
  description?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
  tag?: string;
  template?: string;
  environment?: string;
  schemaId?: number;
  children: CurriculumNode[];
  childrenLoaded?: boolean;
}

export interface CurriculumSchemaOption {
  id: number;
  name: string;
}

export interface CurriculumUserOption {
  id: number;
  name: string;
}

export interface SaveCurriculumPayload {
  id?: number;
  parentId?: number;
  kind: CurriculumKind;
  name: string;
  description?: string;
  status?: number;
  startDate?: string;
  endDate?: string;
  tag?: string;
  template?: string;
  environment?: string;
  schemaId?: number;
  userIds?: number[];
}

export interface ArchiveCurriculumPayload {
  kind: CurriculumKind;
  id: number;
}
