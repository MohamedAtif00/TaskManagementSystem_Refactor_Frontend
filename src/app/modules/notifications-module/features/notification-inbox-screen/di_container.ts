import { Provider } from '@angular/core';
import { NotificationInboxRepository } from './domain/repository/notification-inbox.repository';
import { NotificationInboxImplementationRepository } from './data/repository/notification-inbox-implementation.repository';
import { NotificationInboxRemoteDataSource } from './data/data_source/remote/notification-inbox-remote-datasource';
import { NotificationInboxRemoteDataSourceImpl } from './data/data_source/remote/notification-inbox-remote-datasource-impl';
import { NotificationInboxLocalDataSource } from './data/data_source/local/notification-inbox-local-datasource';
import { NotificationInboxLocalDataSourceImpl } from './data/data_source/local/notification-inbox-local-datasource-impl';
import { ListNotificationsUseCase } from './domain/usecase/list-notifications.usecase';
import { MarkNotificationReadUseCase } from './domain/usecase/mark-notification-read.usecase';
import { MarkAllNotificationsReadUseCase } from './domain/usecase/mark-all-notifications-read.usecase';

export const NOTIFICATION_INBOX_DI_CONTAINER: Provider[] = [
  { provide: NotificationInboxRepository, useClass: NotificationInboxImplementationRepository },
  { provide: NotificationInboxRemoteDataSource, useClass: NotificationInboxRemoteDataSourceImpl },
  { provide: NotificationInboxLocalDataSource, useClass: NotificationInboxLocalDataSourceImpl },
  ListNotificationsUseCase,
  MarkNotificationReadUseCase,
  MarkAllNotificationsReadUseCase,
];
