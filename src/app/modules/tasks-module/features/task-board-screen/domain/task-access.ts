import { AuthUser } from '@core/models/auth-user.model';
import { PermissionCodes, permissionSatisfied } from '@core/models/permission-codes';
import { TaskAccess } from './entity/task-board.entity';

export function taskAccessFor(
  user: AuthUser | null,
  task: { status: number; teamId?: number | null; user?: { id: number } },
): TaskAccess {
  if (!user || task.status === 3 || task.status === 4) {
    return 'None';
  }

  const assignedToSelf = task.user?.id === user.id;
  const unassigned = !task.user;
  const backlog = task.status === 0;
  const canTake = assignedToSelf || unassigned || backlog;
  const sameTeam = task.teamId != null && user.teamId != null && task.teamId === user.teamId;
  const inHeadedSection = task.teamId != null && (user.headedTeamIds ?? []).includes(task.teamId);
  const hasOrgScope = user.teamId != null || (user.headedTeamIds?.length ?? 0) > 0;
  const permissions = user.permissions ?? [];

  if (permissionSatisfied(permissions, PermissionCodes.Tickets.Manage)) {
    return canTake ? 'WorkOnAndManage' : 'Manage';
  }

  if (permissionSatisfied(permissions, PermissionCodes.Tickets.Update)) {
    if (hasOrgScope && !sameTeam && !inHeadedSection) {
      return 'None';
    }
    return canTake ? 'WorkOnAndManage' : 'Manage';
  }

  if (permissionSatisfied(permissions, PermissionCodes.Tickets.Read) && sameTeam && (assignedToSelf || backlog)) {
    return 'WorkOn';
  }

  return 'None';
}
