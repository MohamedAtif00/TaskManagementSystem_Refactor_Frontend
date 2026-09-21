export interface ProjectRootEntity {
  id: number;
  name: string;
  description: string;
  status: string;
  subjectCount: number;
  year: string;
  yearId: number;
}

export interface ProjectListParams {
  search: string;
}

export interface ProjectFormPayload {
  id?: number;
  yearId: number;
  name: string;
  description: string;
}

export interface ProjectFormOptions {
  years: { id: number; name: string }[];
}
