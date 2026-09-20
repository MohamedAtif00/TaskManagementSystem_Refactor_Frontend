import { SectionEntity, SectionFormOptions } from '../../domain/entity/section-list.entity';

export type SectionModel = SectionEntity;
export type SectionFormOptionsModel = SectionFormOptions;

export class SectionListMapper {
  static toEntity(model: SectionModel): SectionEntity {
    return { ...model, teams: [...model.teams] };
  }

  static toFormOptions(model: SectionFormOptionsModel): SectionFormOptions {
    return {
      heads: [...model.heads],
      teams: [...model.teams],
    };
  }
}
