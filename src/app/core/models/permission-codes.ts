export const PermissionCodes = {
  Organization: {
    Read: 'organization.read',
    Create: 'organization.create',
    Update: 'organization.update',
    Delete: 'organization.delete',
    Manage: 'organization.manage',
  },
  Workflows: {
    Read: 'workflows.read',
    Create: 'workflows.create',
    Update: 'workflows.update',
    Delete: 'workflows.delete',
    Manage: 'workflows.manage',
  },
  Curriculum: {
    Read: 'curriculum.read',
    Create: 'curriculum.create',
    Update: 'curriculum.update',
    Delete: 'curriculum.delete',
    Manage: 'curriculum.manage',
  },
  Sprints: {
    Read: 'sprints.read',
    Create: 'sprints.create',
    Update: 'sprints.update',
    Delete: 'sprints.delete',
    Manage: 'sprints.manage',
  },
  Tickets: {
    Read: 'tickets.read',
    Create: 'tickets.create',
    Update: 'tickets.update',
    Delete: 'tickets.delete',
    Manage: 'tickets.manage',
  },
  Notifications: {
    Read: 'notifications.read',
    Update: 'notifications.update',
    Manage: 'notifications.manage',
  },
  HrLeave: {
    Read: 'hr.leave.read',
    Create: 'hr.leave.create',
    Update: 'hr.leave.update',
    Delete: 'hr.leave.delete',
    Manage: 'hr.leave.manage',
  },
  HrHolidays: {
    Read: 'hr.holidays.read',
    Create: 'hr.holidays.create',
    Update: 'hr.holidays.update',
    Delete: 'hr.holidays.delete',
    Manage: 'hr.holidays.manage',
  },
  HrTimeoff: {
    Read: 'hr.timeoff.read',
    Create: 'hr.timeoff.create',
    Update: 'hr.timeoff.update',
    Delete: 'hr.timeoff.delete',
    Manage: 'hr.timeoff.manage',
  },
  HrWorkFromHome: {
    Read: 'hr.workfromhome.read',
    Create: 'hr.workfromhome.create',
    Update: 'hr.workfromhome.update',
    Delete: 'hr.workfromhome.delete',
    Manage: 'hr.workfromhome.manage',
  },
  HrForgotClock: {
    Read: 'hr.forgotclock.read',
    Create: 'hr.forgotclock.create',
    Update: 'hr.forgotclock.update',
    Delete: 'hr.forgotclock.delete',
    Manage: 'hr.forgotclock.manage',
  },
  IdentityUsers: {
    Read: 'identity.users.read',
    Create: 'identity.users.create',
    Update: 'identity.users.update',
    Delete: 'identity.users.delete',
    Manage: 'identity.users.manage',
  },
  IdentityRoles: {
    Read: 'identity.roles.read',
    Create: 'identity.roles.create',
    Update: 'identity.roles.update',
    Delete: 'identity.roles.delete',
    Manage: 'identity.roles.manage',
  },
} as const;

export const ALL_PERMISSION_CODES: string[] = Object.values(PermissionCodes).flatMap((group) => Object.values(group));

export function manageCodeFor(permissionCode: string): string {
  const lastDot = permissionCode.lastIndexOf('.');
  if (lastDot <= 0) {
    return permissionCode;
  }
  return `${permissionCode.slice(0, lastDot)}.manage`;
}

export function permissionSatisfied(held: readonly string[], required: string): boolean {
  return held.includes(required) || held.includes(manageCodeFor(required));
}

export function hasAnyPermission(held: readonly string[], required: readonly string[]): boolean {
  return required.some((code) => permissionSatisfied(held, code));
}

export const OWNER_PERMISSIONS = ALL_PERMISSION_CODES.filter((code) => code.endsWith('.manage'));

export const PROJECT_MANAGER_PERMISSIONS = [
  PermissionCodes.IdentityUsers.Manage,
  PermissionCodes.IdentityRoles.Manage,
  PermissionCodes.Organization.Manage,
  PermissionCodes.Workflows.Manage,
  PermissionCodes.Curriculum.Manage,
  PermissionCodes.Sprints.Manage,
  PermissionCodes.Tickets.Manage,
  PermissionCodes.Notifications.Read,
  PermissionCodes.HrLeave.Read,
  PermissionCodes.HrLeave.Create,
  PermissionCodes.HrLeave.Update,
  PermissionCodes.HrHolidays.Read,
  PermissionCodes.HrTimeoff.Read,
  PermissionCodes.HrTimeoff.Create,
  PermissionCodes.HrTimeoff.Update,
  PermissionCodes.HrWorkFromHome.Read,
  PermissionCodes.HrWorkFromHome.Create,
  PermissionCodes.HrWorkFromHome.Update,
  PermissionCodes.HrForgotClock.Read,
  PermissionCodes.HrForgotClock.Create,
  PermissionCodes.HrForgotClock.Update,
];

export const APPROVER_PERMISSIONS = [
  PermissionCodes.Tickets.Read,
  PermissionCodes.Tickets.Update,
  PermissionCodes.Sprints.Read,
  PermissionCodes.Curriculum.Read,
  PermissionCodes.Notifications.Read,
  PermissionCodes.HrLeave.Read,
  PermissionCodes.HrLeave.Create,
  PermissionCodes.HrLeave.Update,
  PermissionCodes.HrTimeoff.Read,
  PermissionCodes.HrTimeoff.Create,
  PermissionCodes.HrTimeoff.Update,
  PermissionCodes.HrWorkFromHome.Read,
  PermissionCodes.HrWorkFromHome.Create,
  PermissionCodes.HrWorkFromHome.Update,
  PermissionCodes.HrForgotClock.Read,
  PermissionCodes.HrForgotClock.Create,
  PermissionCodes.HrForgotClock.Update,
];

export const MEMBER_PERMISSIONS = [
  PermissionCodes.Tickets.Read,
  PermissionCodes.Sprints.Read,
  PermissionCodes.Notifications.Read,
  PermissionCodes.HrLeave.Read,
  PermissionCodes.HrLeave.Create,
  PermissionCodes.HrTimeoff.Read,
  PermissionCodes.HrTimeoff.Create,
  PermissionCodes.HrWorkFromHome.Read,
  PermissionCodes.HrWorkFromHome.Create,
  PermissionCodes.HrForgotClock.Read,
  PermissionCodes.HrForgotClock.Create,
];
