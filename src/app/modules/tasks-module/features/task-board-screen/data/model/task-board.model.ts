import {
  TaskBoardEntity,
  TaskBoardPageEntity,
  TaskCardEntity,
  TaskColumnPageEntity,
  TaskDetailsEntity,
  TaskIdName,
} from '../../domain/entity/task-board.entity';

export type TaskBoardModel = TaskBoardEntity;
export type TaskBoardPageModel = TaskBoardPageEntity;
export type TaskCardModel = TaskCardEntity;
export type TaskColumnPageModel = TaskColumnPageEntity;
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

  static toColumnPage(model: TaskColumnPageModel): TaskColumnPageEntity {
    return {
      items: model.items.map((card) => this.toCard(card)),
      page: model.page,
      pageSize: model.pageSize,
      totalCount: model.totalCount,
    };
  }

  static toBoardPage(model: TaskBoardPageModel): TaskBoardPageEntity {
    return {
      items: model.items.map((card) => this.toCard(card)),
      page: model.page,
      pageSize: model.pageSize,
      totalCount: model.totalCount,
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
      teamId: model.teamId ?? null,
      subjectId: model.subjectId,
      subjectName: model.subjectName,
      attention: model.attention,
      duration: model.duration ?? 0,
      tl: model.tl,
      isReview: model.isReview,
      createdAt: model.createdAt,
      startedAt: model.startedAt,
      doneAt: model.doneAt,
      access: model.access ?? 'None',
    };
  }
}
