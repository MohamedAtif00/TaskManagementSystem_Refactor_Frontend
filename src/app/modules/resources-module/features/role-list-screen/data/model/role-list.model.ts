import { RoleEntity, RolePermissionOption } from '../../domain/entity/role-list.entity';

export type RoleModel = RoleEntity;
export type RolePermissionModel = RolePermissionOption;

export class RoleListMapper {
  static toEntity(model: RoleModel): RoleEntity {
    return { ...model, permissionCodes: [...model.permissionCodes] };
  }
}
