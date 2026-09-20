export interface ProjectRootEntity {
  id: number;
  name: string;
  description: string;
  status: string;
  subjectCount: number;
  year: string;
}

export interface ProjectListParams {
  search: string;
}
