import { DEFAULT_PAGE_SIZE, ListPageResponse } from '@core/models/list-page.model';
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

export interface MemberLeaveListParams {
  page: number;
  pageSize: number;
}

export type MemberLeaveListPage = ListPageResponse<MemberLeaveRow>;

export const MEMBER_LEAVE_PAGE_SIZE = DEFAULT_PAGE_SIZE;
