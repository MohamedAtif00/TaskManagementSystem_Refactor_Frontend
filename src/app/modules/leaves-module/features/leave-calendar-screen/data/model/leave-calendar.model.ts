import { LeaveQueueItem } from '../../domain/entity/leave-calendar.entity';

export type LeaveQueueModel = LeaveQueueItem;

export class LeaveCalendarMapper {
  static toEntity(model: LeaveQueueModel): LeaveQueueItem {
    return { ...model, user: { ...model.user } };
  }
}
