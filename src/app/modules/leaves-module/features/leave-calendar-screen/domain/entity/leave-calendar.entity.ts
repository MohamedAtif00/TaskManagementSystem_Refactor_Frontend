import { DEFAULT_PAGE_SIZE, ListPageResponse } from '@core/models/list-page.model';

export type LeaveKind = 'leave' | 'permission' | 'wfh' | 'forgotClock';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveQueueUser {
  id: number;
  name: string;
  code: string;
}

export interface LeaveQueueItem {
  kind: LeaveKind;
  id: number;
  user: LeaveQueueUser;
  typeLabel: string;
  datesLabel: string;
  durationLabel: string;
  status: LeaveStatus;
  dateCreated: string;
  reason?: string;
  note?: string;
}

export interface LeaveQueueFilters {
  status: LeaveStatus | '';
  type: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
}

export type LeaveQueuePage = ListPageResponse<LeaveQueueItem>;

export const LEAVE_QUEUE_PAGE_SIZE = DEFAULT_PAGE_SIZE;

export interface DecidePayload {
  kind: LeaveKind;
  id: number;
  approved: boolean;
  comment?: string;
  asOwner?: boolean;
}

export interface BulkDecidePayload {
  kind: LeaveKind;
  ids: number[];
  approved: boolean;
  comment?: string;
}

export interface BulkOpinionResult {
  succeeded: number;
  failed: number;
  failedIds?: number[];
}
