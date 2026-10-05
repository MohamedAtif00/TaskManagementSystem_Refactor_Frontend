import { DEFAULT_PAGE_SIZE, ListPageResponse } from '@core/models/list-page.model';
import { UserRole } from '@core/models/user-role';

export interface UserListItemEntity {
  id: number;
  name: string;
  group: string;
  role: UserRole;
  roleName: string;
  hrCode: string;
}

export interface UserListParams {
  search: string;
  page: number;
  pageSize: number;
}

export type UserListPageEntity = ListPageResponse<UserListItemEntity>;

export const USER_LIST_PAGE_SIZE = DEFAULT_PAGE_SIZE;

export interface UserFormPayload {
  id?: number;
  name: string;
  hrCode: string;
  email?: string;
  phone?: string;
  title?: string;
  roleId: number;
  accountType: number;
  teamId?: number | null;
}

export interface UserDetailEntity {
  id: number;
  code: string;
  name: string;
  hrCode: string;
  email?: string;
  phone?: string;
  title?: string;
  roleId: number;
  roleName: string;
  accountType: number;
  onBoard: boolean;
  teamId?: number | null;
  teamName?: string;
  teamleaderId?: number | null;
  teamleaderName?: string;
}

export interface UserRoleOption {
  id: number;
  name: string;
}

export interface UserTeamOption {
  id: number;
  name: string;
}

export interface UserFormOptions {
  roles: UserRoleOption[];
  teams: UserTeamOption[];
}

export interface UserBalanceEntity {
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

export interface UserBalanceUpdate {
  userId: number;
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
}
