export interface RolePermissionOption {
  id: number;
  code: string;
  name: string;
}

export interface RoleEntity {
  id: number;
  name: string;
  description: string;
  isSystem: boolean;
  permissionCount: number;
  permissionCodes: string[];
}

export interface RoleFormPayload {
  id?: number;
  name: string;
  description: string;
  permissionIds: number[];
}
