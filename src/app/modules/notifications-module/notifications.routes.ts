import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { PermissionCodes } from '@core/models/permission-codes';
import { NOTIFICATION_INBOX_DI_CONTAINER } from './features/notification-inbox-screen/di_container';

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [roleGuard],
    data: { permissions: [PermissionCodes.Notifications.Read] },
    providers: NOTIFICATION_INBOX_DI_CONTAINER,
    loadComponent: () =>
      import('./features/notification-inbox-screen/presentation/notification-inbox.component').then(
        (m) => m.NotificationInboxComponent,
      ),
  },
];
