import { TaskSubjectEntity } from '../../domain/entity/task-list.entity';

export type TaskSubjectModel = TaskSubjectEntity;

export class TaskListMapper {
  static toEntity(model: TaskSubjectModel): TaskSubjectEntity {
    return { ...model };
  }
}
