import { Observable } from 'rxjs';
import { ProjectListParams, ProjectRootEntity } from '../entity/project-list.entity';

export abstract class ProjectListRepository {
  abstract getProjects(params: ProjectListParams): Observable<ProjectRootEntity[]>;
}
