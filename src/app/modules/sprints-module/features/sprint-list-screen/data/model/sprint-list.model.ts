import {
  SprintEntity,
  SprintLoOption,
  SprintSubjectOption,
} from '../../domain/entity/sprint-list.entity';

export type SprintModel = SprintEntity;
export type SprintSubjectModel = SprintSubjectOption;
export type SprintLoModel = SprintLoOption;

export class SprintListMapper {
  static toEntity(model: SprintModel): SprintEntity {
    return { ...model, learningObjects: model.learningObjects.map((lo) => ({ ...lo })) };
  }
}
