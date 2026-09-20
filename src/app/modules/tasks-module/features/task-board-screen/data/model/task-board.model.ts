import { TaskBoardEntity, TaskCardEntity, TaskDetailsEntity, TaskIdName } from '../../domain/entity/task-board.entity';

export type TaskBoardModel = TaskBoardEntity;
export type TaskCardModel = TaskCardEntity;
export type TaskDetailsModel = Omit<TaskDetailsEntity, 'access'> & { access?: TaskDetailsEntity['access'] };
export type TaskIdNameModel = TaskIdName;

export class TaskBoardMapper {
  static toBoard(model: TaskBoardModel): TaskBoardEntity {
    return {
      ...model,
      cards: model.cards.map((card) => ({ ...card, learningObjective: { ...card.learningObjective }, user: card.user ? { ...card.user } : undefined })),
      learningObjectives: model.learningObjectives.map((lo) => ({ ...lo })),
      users: model.users.map((user) => ({ ...user })),
    };
  }

  static toCard(model: TaskCardModel): TaskCardEntity {
    return {
      ...model,
      learningObjective: { ...model.learningObjective },
      user: model.user ? { ...model.user } : undefined,
    };
  }

  static toDetails(model: TaskDetailsModel): TaskDetailsEntity {
    return {
      ...this.toCard(model),
      subjectId: model.subjectId,
      subjectName: model.subjectName,
      attention: model.attention,
      createdAt: model.createdAt,
      startedAt: model.startedAt,
      doneAt: model.doneAt,
      access: model.access ?? 'None',
    };
  }
}
