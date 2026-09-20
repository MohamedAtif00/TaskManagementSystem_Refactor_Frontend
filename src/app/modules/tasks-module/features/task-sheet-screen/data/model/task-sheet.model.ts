import { TaskSheetEntity } from '../../domain/entity/task-sheet.entity';

export type TaskSheetModel = TaskSheetEntity;

export class TaskSheetMapper {
  static toEntity(model: TaskSheetModel): TaskSheetEntity {
    return {
      ...model,
      users: model.users.map((user) => ({ ...user })),
      units: model.units.map((unit) => ({
        ...unit,
        lessons: unit.lessons.map((lesson) => ({
          ...lesson,
          learningObjectives: lesson.learningObjectives.map((lo) => ({
            ...lo,
            tasks: lo.tasks.map((task) => ({ ...task, user: task.user ? { ...task.user } : undefined })),
          })),
        })),
      })),
    };
  }
}
