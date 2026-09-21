import { NotificationPage } from '../../domain/entity/notification-inbox.entity';

export type NotificationPageModel = NotificationPage;

export class NotificationInboxMapper {
  static toEntity(model: NotificationPageModel): NotificationPage {
    return {
      ...model,
      items: model.items.map((item) => ({ ...item })),
    };
  }
}
