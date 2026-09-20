import { MyLeavesEntity } from '../../domain/entity/my-leaves.entity';

export type MyLeavesModel = MyLeavesEntity;

export class MyLeavesMapper {
  static toEntity(model: MyLeavesModel): MyLeavesEntity {
    return {
      balances: { ...model.balances },
      leaves: model.leaves.map((row) => ({ ...row, user: { ...row.user } })),
      permissions: model.permissions.map((row) => ({ ...row, user: { ...row.user } })),
      wfh: model.wfh.map((row) => ({ ...row, user: { ...row.user } })),
    };
  }
}
