import { LeaveBalanceEntity, LeaveRequestEntity, PermissionRequestEntity, WfhRequestEntity } from '../../../my-leaves-screen/domain/entity/my-leaves.entity';

export interface MemberLeaveRow {
  id: number;
  name: string;
  code: string;
  balances: LeaveBalanceEntity;
}

export interface MemberLeaveHistory {
  user: { id: number; name: string; code: string };
  balances: LeaveBalanceEntity;
  leaves: LeaveRequestEntity[];
  permissions: PermissionRequestEntity[];
  wfh: WfhRequestEntity[];
}
