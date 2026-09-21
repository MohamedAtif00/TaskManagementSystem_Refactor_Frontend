import { Observable } from 'rxjs';
import { ProjectFormOptions, ProjectFormPayload, ProjectListParams } from '../../../domain/entity/project-list.entity';
import { ProjectRootModel } from '../../model/project-list.model';

export abstract class ProjectListLocalDataSource {
  abstract getProjects(params: ProjectListParams): Observable<ProjectRootModel[]>;
  abstract getProject(id: number): Observable<ProjectRootModel>;
  abstract getFormOptions(): Observable<ProjectFormOptions>;
  abstract saveProject(payload: ProjectFormPayload): Observable<ProjectRootModel>;
  abstract archiveProject(id: number): Observable<void>;
}
