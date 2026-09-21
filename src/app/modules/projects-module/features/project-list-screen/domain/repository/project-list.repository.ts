import { Observable } from 'rxjs';
import {
  ProjectFormOptions,
  ProjectFormPayload,
  ProjectListParams,
  ProjectRootEntity,
} from '../entity/project-list.entity';

export abstract class ProjectListRepository {
  abstract getProjects(params: ProjectListParams): Observable<ProjectRootEntity[]>;
  abstract getProject(id: number): Observable<ProjectRootEntity>;
  abstract getFormOptions(): Observable<ProjectFormOptions>;
  abstract saveProject(payload: ProjectFormPayload): Observable<ProjectRootEntity>;
  abstract archiveProject(id: number): Observable<void>;
}
