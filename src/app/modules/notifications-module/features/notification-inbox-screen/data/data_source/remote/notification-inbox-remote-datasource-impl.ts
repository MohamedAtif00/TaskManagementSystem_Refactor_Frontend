import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NotificationListPageResponse } from '@core/api/tms-contracts';
import { API, apiPath } from '@core/network/api/api.const';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { NotificationListParams } from '../../../domain/entity/notification-inbox.entity';
import { NotificationPageModel } from '../../model/notification-inbox.model';
import { NotificationInboxRemoteDataSource } from './notification-inbox-remote-datasource';

@Injectable()
export class NotificationInboxRemoteDataSourceImpl extends NotificationInboxRemoteDataSource {
  constructor(private network: NetworkService) {
    super();
  }

  list(params: NotificationListParams): Observable<NotificationPageModel> {
    let httpParams = new HttpParams().set('page', String(params.page)).set('pageSize', String(params.pageSize));
    if (params.isRead != null) {
      httpParams = httpParams.set('isRead', String(params.isRead));
    }
    return this.network.get<NotificationListPageResponse>(API.Notifications.List, httpParams).pipe(
      map((page) => ({
        items: (page.items ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          message: item.message,
          category: item.category,
          type: item.type,
          isRead: item.isRead,
          createdAt: item.createdAt,
          relatedEntityId: item.relatedEntityId,
        })),
        page: page.page,
        pageSize: page.pageSize,
        totalCount: page.totalCount,
      })),
      catchError(mapHttpError),
    );
  }

  markRead(id: number): Observable<void> {
    return this.network.patch(apiPath(API.Notifications.Read, { id })).pipe(
      map(() => undefined),
      catchError(mapHttpError),
    );
  }

  markAllRead(): Observable<void> {
    return this.network.patch(API.Notifications.ReadAll).pipe(
      map(() => undefined),
      catchError(mapHttpError),
    );
  }
}
