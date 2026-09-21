import { HolidayEntity } from '../../domain/entity/holiday-list.entity';

export type HolidayModel = HolidayEntity;

export class HolidayListMapper {
  static toEntity(model: HolidayModel): HolidayEntity {
    return { ...model };
  }
}
