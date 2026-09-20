import { TeamEntity } from '../../domain/entity/team-list.entity';

export type TeamModel = TeamEntity;

export class TeamListMapper {
  static toEntity(model: TeamModel): TeamEntity {
    return { ...model, members: [...model.members] };
  }
}
