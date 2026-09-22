import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { PermissionCodes } from '@core/models/permission-codes';
import { notificationTargetRoute } from '@core/navigation/notification-route.util';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { AuthService } from '@core/services/auth.service';
import { NOTIFICATION_INBOX_DI_CONTAINER } from '@modules/notifications-module/features/notification-inbox-screen/di_container';
import { NotificationEntity } from '@modules/notifications-module/features/notification-inbox-screen/domain/entity/notification-inbox.entity';
import { ListNotificationsUseCase } from '@modules/notifications-module/features/notification-inbox-screen/domain/usecase/list-notifications.usecase';
import { MarkAllNotificationsReadUseCase } from '@modules/notifications-module/features/notification-inbox-screen/domain/usecase/mark-all-notifications-read.usecase';
import { MarkNotificationReadUseCase } from '@modules/notifications-module/features/notification-inbox-screen/domain/usecase/mark-notification-read.usecase';
import { ClickOutsideDirective } from '@shared/directives/click-outside.directive';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  imports: [AngularSvgIconModule, ClickOutsideDirective, DatePipe],
  providers: NOTIFICATION_INBOX_DI_CONTAINER,
})
export class NotificationBellComponent implements OnInit {
  readonly notificationsPath = ROUTE_PATHS.notifications;
  readonly isOpen = signal(false);
  readonly loading = signal(false);
  readonly items = signal<NotificationEntity[]>([]);

  constructor(
    public auth: AuthService,
    private router: Router,
    private listUseCase: ListNotificationsUseCase,
    private markReadUseCase: MarkNotificationReadUseCase,
    private markAllUseCase: MarkAllNotificationsReadUseCase,
  ) {}

  ngOnInit(): void {
    if (this.canSeeNotifications) {
      this.loadUnread();
    }
  }

  get canSeeNotifications(): boolean {
    return this.auth.hasPermission(PermissionCodes.Notifications.Read);
  }

  togglePopover(): void {
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next) {
      this.loadUnread();
    }
  }

  closePopover(): void {
    this.isOpen.set(false);
  }

  loadUnread(): void {
    this.loading.set(true);
    this.listUseCase.execute({ page: 1, pageSize: 10, isRead: false }).subscribe({
      next: (page) => {
        this.items.set(page.items);
        this.auth.setUnreadNotifications(page.items.filter((item) => !item.isRead).length);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
    });
  }

  openNotification(row: NotificationEntity, event: Event): void {
    event.stopPropagation();
    if (!row.isRead) {
      this.markReadUseCase.execute(row.id).subscribe({
        error: (err: Error) => toast.error(err.message),
      });
    }
    this.closePopover();
    void this.router.navigate(notificationTargetRoute(row));
  }

  markRead(row: NotificationEntity, event: Event): void {
    event.stopPropagation();
    this.markReadUseCase.execute(row.id).subscribe({
      next: () => this.loadUnread(),
      error: (err: Error) => toast.error(err.message),
    });
  }

  markAllRead(event: Event): void {
    event.stopPropagation();
    this.markAllUseCase.execute().subscribe({
      next: () => {
        this.items.set([]);
        this.auth.setUnreadNotifications(0);
        toast.success('All notifications marked read');
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  viewAll(): void {
    this.closePopover();
    void this.router.navigate([this.notificationsPath]);
  }
}
