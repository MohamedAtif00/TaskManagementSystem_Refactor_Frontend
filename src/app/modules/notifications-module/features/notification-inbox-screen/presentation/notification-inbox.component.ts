import { Component, OnInit, signal } from '@angular/core';
import { toast } from 'ngx-sonner';
import { AuthService } from '@core/services/auth.service';
import { NotificationActionService } from '@core/network/notification-action.service';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { PagerComponent } from '@shared/component/pager/pager.component';
import { FormSkeletonComponent } from '@shared/component/skeleton/form-skeleton.component';
import {
  NotificationEntity,
  NOTIFICATION_INBOX_PAGE_SIZE,
} from '../domain/entity/notification-inbox.entity';
import { ListNotificationsUseCase } from '../domain/usecase/list-notifications.usecase';
import { MarkAllNotificationsReadUseCase } from '../domain/usecase/mark-all-notifications-read.usecase';
import { MarkNotificationReadUseCase } from '../domain/usecase/mark-notification-read.usecase';

@Component({
  selector: 'app-notification-inbox',
  imports: [PageHeaderComponent, ButtonComponent, PagerComponent, FormSkeletonComponent],
  templateUrl: './notification-inbox.component.html',
})
export class NotificationInboxComponent implements OnInit {
  readonly page = signal(1);
  readonly pageSize = NOTIFICATION_INBOX_PAGE_SIZE;
  readonly totalCount = signal(0);
  readonly loading = signal(true);
  readonly rows = signal<NotificationEntity[]>([]);
  unreadOnly = false;

  constructor(
    private auth: AuthService,
    private listUseCase: ListNotificationsUseCase,
    private markReadUseCase: MarkNotificationReadUseCase,
    private markAllUseCase: MarkAllNotificationsReadUseCase,
    private notificationActions: NotificationActionService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.listUseCase
      .execute({
        page: this.page(),
        pageSize: this.pageSize,
        isRead: this.unreadOnly ? false : undefined,
      })
      .subscribe({
        next: (page) => {
          this.rows.set(page.items);
          this.totalCount.set(page.totalCount);
          this.loading.set(false);
          this.refreshUnreadBadge();
        },
        error: (err: Error) => {
          this.loading.set(false);
          toast.error(err.message);
        },
      });
  }

  toggleUnread(): void {
    this.unreadOnly = !this.unreadOnly;
    this.page.set(1);
    this.load();
  }

  markRead(row: NotificationEntity): void {
    this.markReadUseCase.execute(row.id).subscribe({
      next: () => this.load(),
      error: (err: Error) => toast.error(err.message),
    });
  }

  markAll(): void {
    this.markAllUseCase.execute().subscribe({
      next: () => {
        toast.success('All notifications marked read');
        this.load();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  canRespond(row: NotificationEntity): boolean {
    return this.notificationActions.canRespond(row);
  }

  accept(row: NotificationEntity): void {
    this.notificationActions.respond(row, true).subscribe({
      next: () => {
        toast.success('Request accepted');
        this.load();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  reject(row: NotificationEntity): void {
    this.notificationActions.respond(row, false).subscribe({
      next: () => {
        toast.success('Request rejected');
        this.load();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  private refreshUnreadBadge(): void {
    this.listUseCase.execute({ page: 1, pageSize: 1, isRead: false }).subscribe({
      next: (page) => this.auth.setUnreadNotifications(page.totalCount),
      error: () => {},
    });
  }
}
