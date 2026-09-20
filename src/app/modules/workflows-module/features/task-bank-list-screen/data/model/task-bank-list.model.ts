import { TaskBankItem } from '../../domain/entity/task-bank-list.entity';

export type TaskBankItemModel = TaskBankItem;

export class TaskBankListMapper {
  static toEntity(model: TaskBankItemModel): TaskBankItem {
    return { ...model };
  }
}
