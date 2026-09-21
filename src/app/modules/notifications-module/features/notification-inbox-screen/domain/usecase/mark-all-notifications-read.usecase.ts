import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { NotificationInboxRepository } from '../repository/notification-inbox.repository';

@Injectable()
export class MarkAllNotificationsReadUseCase implements BaseUseCase<void, void> {
  constructor(private repository: NotificationInboxRepository) {}

  execute(): Observable<void> {
    return this.repository.markAllRead();
  }
}
