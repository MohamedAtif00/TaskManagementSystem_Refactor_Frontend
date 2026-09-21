export type ForgotClockPunchType = 'In' | 'Out';
export type ForgotClockStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface ForgotClockEntity {
  id: number;
  punchType: ForgotClockPunchType;
  attendanceDate: string;
  intendedTime: string;
  reason?: string;
  status: ForgotClockStatus;
}

export interface CreateForgotClockForm {
  punchType: ForgotClockPunchType;
  attendanceDate: string;
  intendedTime: string;
  reason?: string;
}
