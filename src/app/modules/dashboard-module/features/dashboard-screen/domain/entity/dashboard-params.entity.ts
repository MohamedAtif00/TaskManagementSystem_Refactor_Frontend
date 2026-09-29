import { PermissionCodes, permissionSatisfied } from '@core/models/permission-codes';

export type DashboardView = 'projectManager' | 'sectionHead' | 'teamLeader' | 'member';

export interface DashboardParams {
  permissions: string[];
  userId: number;
  teamId?: number | null;
  headedTeamIds?: number[];
}

export function dashboardView(params: DashboardParams): DashboardView {
  const permissions = params.permissions ?? [];
  if (
    permissionSatisfied(permissions, PermissionCodes.Tickets.Manage) ||
    permissionSatisfied(permissions, PermissionCodes.Curriculum.Manage)
  ) {
    return 'projectManager';
  }
  if (permissionSatisfied(permissions, PermissionCodes.Tickets.Update) && (params.headedTeamIds?.length ?? 0) > 0) {
    return 'sectionHead';
  }
  if (permissionSatisfied(permissions, PermissionCodes.Tickets.Update) && params.teamId != null) {
    return 'teamLeader';
  }
  return 'member';
}
