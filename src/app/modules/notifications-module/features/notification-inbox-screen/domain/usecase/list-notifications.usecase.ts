import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { NotificationListParams, NotificationPage } from '../entity/notification-inbox.entity';
import { NotificationInboxRepository } from '../repository/notification-inbox.repository';

@Injectable()
export class ListNotificationsUseCase implements BaseUseCase<NotificationListParams, NotificationPage> {
  constructor(private repository: NotificationInboxRepository) {}

  execute(params: NotificationListParams): Observable<NotificationPage> {
    return this.repository.list(params);
  }
}
