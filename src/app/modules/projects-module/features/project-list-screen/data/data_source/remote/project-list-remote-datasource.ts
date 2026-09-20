import { Observable } from 'rxjs';
import { ProjectListParams } from '../../../domain/entity/project-list.entity';
import { ProjectRootModel } from '../../model/project-list.model';

export abstract class ProjectListRemoteDataSource {
  abstract getProjects(params: ProjectListParams): Observable<ProjectRootModel[]>;
}
