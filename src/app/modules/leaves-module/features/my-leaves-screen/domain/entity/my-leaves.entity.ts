export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
export type LeaveType = 'Annual' | 'Sick' | 'Emergency' | 'UnpaidLeave';
export type PermissionType = 'EarlyDeparture' | 'LateArrival' | 'WorkAssignment' | 'Departure';
export type LeaveKind = 'leave' | 'permission' | 'wfh';

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

export interface MyLeavesEntity {
  balances: LeaveBalanceEntity;
  leaves: LeaveRequestEntity[];
  permissions: PermissionRequestEntity[];
  wfh: WfhRequestEntity[];
}

export interface CreateLeavePayload {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
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

export interface CancelRequestPayload {
  kind: LeaveKind;
  id: number;
}
