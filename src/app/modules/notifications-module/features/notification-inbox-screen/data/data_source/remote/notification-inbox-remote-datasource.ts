import { Observable } from 'rxjs';
import { NotificationListParams } from '../../../domain/entity/notification-inbox.entity';
import { NotificationPageModel } from '../../model/notification-inbox.model';

export abstract class NotificationInboxRemoteDataSource {
  abstract list(params: NotificationListParams): Observable<NotificationPageModel>;
  abstract markRead(id: number): Observable<void>;
  abstract markAllRead(): Observable<void>;
}
