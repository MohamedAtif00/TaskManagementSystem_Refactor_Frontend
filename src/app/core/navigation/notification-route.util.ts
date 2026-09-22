import { ROUTE_PATHS } from './route-paths.const';

export interface NotificationRouteInput {
  category: string;
  relatedEntityId?: number | null;
}

/** Resolves a notification row to an in-app route for popover deep links. */
export function notificationTargetRoute(notification: NotificationRouteInput): string[] {
  const relatedId = notification.relatedEntityId;

  switch (notification.category?.toLowerCase()) {
    case 'ticket':
      return relatedId != null ? [ROUTE_PATHS.tasks, String(relatedId), 'board'] : [ROUTE_PATHS.notifications];
    case 'hr':
      return [ROUTE_PATHS.myLeaves];
    case 'sprint':
      return relatedId != null ? [ROUTE_PATHS.sprintBoard(relatedId)] : [ROUTE_PATHS.sprints];
    default:
      return [ROUTE_PATHS.notifications];
  }
}
