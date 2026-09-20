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
}

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
  name: string;
  hrCode: string;
  email?: string;
  phone?: string;
  title?: string;
  roleId: number;
  roleName: string;
  accountType: number;
  teamId?: number | null;
  teamName?: string;
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
