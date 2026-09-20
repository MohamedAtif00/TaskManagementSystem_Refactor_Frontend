import { UserDetailEntity, UserFormOptions, UserListItemEntity } from '../../domain/entity/user-list.entity';

export type UserListItemModel = UserListItemEntity;
export type UserDetailModel = UserDetailEntity;
export type UserFormOptionsModel = UserFormOptions;

export class UserListMapper {
  static toEntity(model: UserListItemModel): UserListItemEntity {
    return { ...model };
  }

  static toDetail(model: UserDetailModel): UserDetailEntity {
    return { ...model };
  }

  static toFormOptions(model: UserFormOptionsModel): UserFormOptions {
    return {
      roles: [...model.roles],
      teams: [...model.teams],
    };
  }
}
