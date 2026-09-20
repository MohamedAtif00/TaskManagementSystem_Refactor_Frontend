import { MemberLeaveHistory, MemberLeaveRow } from '../../domain/entity/members-leaves.entity';

export type MemberLeaveRowModel = MemberLeaveRow;
export type MemberLeaveHistoryModel = MemberLeaveHistory;

export class MembersLeavesMapper {
  static toRow(model: MemberLeaveRowModel): MemberLeaveRow {
    return { ...model, balances: { ...model.balances } };
  }

  static toHistory(model: MemberLeaveHistoryModel): MemberLeaveHistory {
    return {
      user: { ...model.user },
      balances: { ...model.balances },
      leaves: model.leaves.map((row) => ({ ...row, user: { ...row.user } })),
      permissions: model.permissions.map((row) => ({ ...row, user: { ...row.user } })),
      wfh: model.wfh.map((row) => ({ ...row, user: { ...row.user } })),
    };
  }
}
