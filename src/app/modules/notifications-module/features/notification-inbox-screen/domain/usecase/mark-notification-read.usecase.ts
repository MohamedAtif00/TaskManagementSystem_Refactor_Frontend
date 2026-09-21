import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUseCase } from '@core/base/usecase/base-usecase';
import { NotificationInboxRepository } from '../repository/notification-inbox.repository';

@Injectable()
export class MarkNotificationReadUseCase implements BaseUseCase<number, void> {
  constructor(private repository: NotificationInboxRepository) {}

  execute(id: number): Observable<void> {
    return this.repository.markRead(id);
  }
}
