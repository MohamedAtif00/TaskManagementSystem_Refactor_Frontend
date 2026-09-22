export interface NotificationEntity {
  id: number;
  title: string;
  message: string;
  category: string;
  type: string;
  isRead: boolean;
  hasActions?: boolean;
  status?: string | null;
  createdAt: string;
  relatedEntityId?: number | null;
}

export interface NotificationPage {
  items: NotificationEntity[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface NotificationListParams {
  page: number;
  pageSize: number;
  isRead?: boolean;
}
