import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { API, apiPath } from './api/api.const';
import { mapHttpError } from './http-error';
import { NetworkService } from './network.service';

export type HrNotificationKind = 'leave' | 'permission' | 'wfh' | 'forgotClock';

export interface ActionableNotification {
  id: number;
  category: string;
  type: string;
  relatedEntityId?: number | null;
  hasActions?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationActionService {
  constructor(private network: NetworkService) {}

  canRespond(notification: ActionableNotification): boolean {
    return !!notification.hasActions && !!notification.relatedEntityId && !!this.resolveKind(notification);
  }

  respond(notification: ActionableNotification, approved: boolean): Observable<void> {
    const kind = this.resolveKind(notification);
    const entityId = notification.relatedEntityId;
    if (!kind || !entityId) {
      return throwError(() => new Error('This notification cannot be actioned from the inbox.'));
    }

    const opinionUrl = this.opinionUrl(kind, entityId);
    const body = { isApproved: approved, comment: approved ? 'Approved from inbox' : 'Rejected from inbox' };

    return this.network.post(opinionUrl, body).pipe(
      switchMap(() => this.network.patch(apiPath(API.Notifications.Read, { id: notification.id }))),
      map(() => undefined),
      catchError(mapHttpError),
    );
  }

  private resolveKind(notification: ActionableNotification): HrNotificationKind | null {
    const haystack = `${notification.category} ${notification.type}`.toLowerCase();
    if (haystack.includes('leave')) return 'leave';
    if (haystack.includes('permission')) return 'permission';
    if (haystack.includes('wfh') || haystack.includes('work from home') || haystack.includes('work-from-home')) {
      return 'wfh';
    }
    if (haystack.includes('forgot') || haystack.includes('clock')) return 'forgotClock';
    return notification.hasActions ? 'leave' : null;
  }

  private opinionUrl(kind: HrNotificationKind, id: number): string {
    switch (kind) {
      case 'leave':
        return apiPath(API.Leaves.Opinion, { id });
      case 'permission':
        return apiPath(API.Permissions.Opinion, { id });
      case 'forgotClock':
        return apiPath(API.ForgotClock.Opinion, { id });
      default:
        return apiPath(API.WorkFromHome.Opinion, { id });
    }
  }
}
