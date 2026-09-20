import { ProjectRootEntity } from '../../domain/entity/project-list.entity';

export type ProjectRootModel = ProjectRootEntity;

export class ProjectListMapper {
  static toEntity(model: ProjectRootModel): ProjectRootEntity {
    return { ...model };
  }
}
