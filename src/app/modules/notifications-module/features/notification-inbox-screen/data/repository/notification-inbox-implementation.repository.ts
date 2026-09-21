import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { NotificationListParams, NotificationPage } from '../../domain/entity/notification-inbox.entity';
import { NotificationInboxRepository } from '../../domain/repository/notification-inbox.repository';
import { NotificationInboxLocalDataSource } from '../data_source/local/notification-inbox-local-datasource';
import { NotificationInboxRemoteDataSource } from '../data_source/remote/notification-inbox-remote-datasource';
import { NotificationInboxMapper } from '../model/notification-inbox.model';

@Injectable()
export class NotificationInboxImplementationRepository implements NotificationInboxRepository {
  constructor(
    private local: NotificationInboxLocalDataSource,
    private remote: NotificationInboxRemoteDataSource,
  ) {}

  list(params: NotificationListParams): Observable<NotificationPage> {
    const source = environment.useMock ? this.local.list(params) : this.remote.list(params);
    return source.pipe(map((page) => NotificationInboxMapper.toEntity(page)));
  }

  markRead(id: number): Observable<void> {
    return environment.useMock ? this.local.markRead(id) : this.remote.markRead(id);
  }

  markAllRead(): Observable<void> {
    return environment.useMock ? this.local.markAllRead() : this.remote.markAllRead();
  }
}
