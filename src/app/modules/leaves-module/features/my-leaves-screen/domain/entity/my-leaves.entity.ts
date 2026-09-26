import { DEFAULT_PAGE_SIZE, ListPageResponse } from '@core/models/list-page.model';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
export type LeaveType = 'Annual' | 'Sick' | 'Emergency' | 'UnpaidLeave' | 'FromNextBalance';
export type PermissionType = 'EarlyDeparture' | 'LateArrival' | 'WorkAssignment' | 'Departure';
export type LeaveKind = 'leave' | 'permission' | 'wfh' | 'forgotClock';
export type ForgotClockPunchType = 'In' | 'Out';

export interface LeaveBalanceEntity {
  annualUsed: number;
  annualMax: number;
  sickUsed: number;
  emergencyUsed: number;
  emergencyMax: number;
  permissionUsed: number;
  permissionMax: number;
  wfhUsed: number;
  wfhMax: number;
  fromNextUsed: number;
  fromNextMax: number;
}

export interface LeavePreviewEntity {
  requestedDays: number;
  availableAnnual: number;
  neededFromNext: number;
  fromNextBalanceMaxDays: number;
  alreadyUsedFromNext: number;
  pendingFromNext: number;
  requiresConfirmation: boolean;
  errorMessage?: string | null;
}

export interface LeaveUserRef {
  id: number;
  name: string;
  code: string;
}

export interface LeaveRequestEntity {
  id: number;
  userId: number;
  user: LeaveUserRef;
  type: LeaveType;
  startDate: string;
  endDate: string;
  duration: number;
  reason?: string;
  status: LeaveStatus;
  dateCreated: string;
  comment?: string;
}

export interface PermissionRequestEntity {
  id: number;
  userId: number;
  user: LeaveUserRef;
  type: PermissionType;
  permissionDate: string;
  fromTime: string;
  toTime: string;
  duration: number;
  reason?: string;
  status: LeaveStatus;
  dateCreated: string;
  comment?: string;
}

export interface WfhRequestEntity {
  id: number;
  userId: number;
  user: LeaveUserRef;
  date: string;
  note?: string;
  status: LeaveStatus;
  dateCreated: string;
  comment?: string;
}

export interface ForgotClockRequestEntity {
  id: number;
  userId: number;
  user: LeaveUserRef;
  punchType: ForgotClockPunchType;
  attendanceDate: string;
  intendedTime: string;
  reason?: string;
  status: LeaveStatus;
  dateCreated: string;
  comment?: string;
}

export interface MyLeavesEntity {
  balances: LeaveBalanceEntity;
  leaves: LeaveRequestEntity[];
  permissions: PermissionRequestEntity[];
  wfh: WfhRequestEntity[];
  forgotClock: ForgotClockRequestEntity[];
}

export type MyLeaveSegment = 'upcoming' | 'earlier';

export interface MyLeaveListParams {
  userId: number;
  kind: LeaveKind;
  segment: MyLeaveSegment;
  page: number;
  pageSize: number;
}

export type MyLeaveRequestItem =
  | LeaveRequestEntity
  | PermissionRequestEntity
  | WfhRequestEntity
  | ForgotClockRequestEntity;

export type MyLeaveRequestPage = ListPageResponse<MyLeaveRequestItem>;

export const MY_LEAVE_PAGE_SIZE = DEFAULT_PAGE_SIZE;

export interface CreateLeavePayload {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  noteForManager?: string;
  confirmFromNextBalance?: boolean;
  medicalCertificate?: File | null;
}

export interface CreatePermissionPayload {
  type: PermissionType;
  permissionDate: string;
  fromTime: string;
  toTime: string;
  reason?: string;
}

export interface CreateWfhPayload {
  date: string;
  note?: string;
}

export interface CreateForgotClockPayload {
  punchType: ForgotClockPunchType;
  attendanceDate: string;
  intendedTime: string;
  reason?: string;
}

export interface CancelRequestPayload {
  kind: LeaveKind;
  id: number;
}
