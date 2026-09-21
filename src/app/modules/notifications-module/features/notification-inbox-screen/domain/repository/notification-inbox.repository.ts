import { Observable } from 'rxjs';
import { NotificationListParams, NotificationPage } from '../entity/notification-inbox.entity';

export abstract class NotificationInboxRepository {
  abstract list(params: NotificationListParams): Observable<NotificationPage>;
  abstract markRead(id: number): Observable<void>;
  abstract markAllRead(): Observable<void>;
}
