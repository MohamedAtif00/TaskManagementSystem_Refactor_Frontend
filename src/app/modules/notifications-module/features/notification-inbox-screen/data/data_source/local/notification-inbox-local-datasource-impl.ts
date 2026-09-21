import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { NotificationEntity, NotificationListParams } from '../../../domain/entity/notification-inbox.entity';
import { NotificationPageModel } from '../../model/notification-inbox.model';
import { NotificationInboxLocalDataSource } from './notification-inbox-local-datasource';

@Injectable()
export class NotificationInboxLocalDataSourceImpl extends NotificationInboxLocalDataSource {
  private rows: NotificationEntity[] = [
    {
      id: 1,
      title: 'Leave request pending',
      message: 'A leave request is waiting for your opinion.',
      category: 'HR',
      type: 'Leave',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Ticket assigned',
      message: 'You were assigned a ticket on the board.',
      category: 'Tickets',
      type: 'Assignment',
      isRead: true,
      createdAt: new Date().toISOString(),
    },
  ];

  list(params: NotificationListParams): Observable<NotificationPageModel> {
    const filtered = this.rows.filter((row) => params.isRead == null || row.isRead === params.isRead);
    const start = (params.page - 1) * params.pageSize;
    return of({
      items: filtered.slice(start, start + params.pageSize),
      page: params.page,
      pageSize: params.pageSize,
      totalCount: filtered.length,
    }).pipe(delay(80));
  }

  markRead(id: number): Observable<void> {
    this.rows = this.rows.map((row) => (row.id === id ? { ...row, isRead: true } : row));
    return of(undefined).pipe(delay(40));
  }

  markAllRead(): Observable<void> {
    this.rows = this.rows.map((row) => ({ ...row, isRead: true }));
    return of(undefined).pipe(delay(40));
  }
}
