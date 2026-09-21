import { MenuItem } from '../models/menu.model';
import { PermissionCodes } from '../models/permission-codes';
import { UserRole } from '../models/user-role';
import { ROUTE_PATHS } from '../navigation/route-paths.const';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'Overview',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Dashboard',
          route: ROUTE_PATHS.dashboard,
        },
        {
          icon: 'assets/icons/heroicons/outline/bell.svg',
          label: 'Notifications',
          route: ROUTE_PATHS.notifications,
          permissions: [PermissionCodes.Notifications.Read],
        },
      ],
    },
    {
      group: 'Work',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/folder.svg',
          label: 'Projects',
          route: ROUTE_PATHS.projects,
          roles: [UserRole.ProjectManager, UserRole.Owner],
          permissions: [PermissionCodes.Curriculum.Read],
        },
        {
          icon: 'assets/icons/heroicons/outline/view-grid.svg',
          label: 'Kanban',
          route: ROUTE_PATHS.tasks,
        },
        {
          icon: 'assets/icons/heroicons/outline/bookmark.svg',
          label: 'Sprints',
          route: ROUTE_PATHS.sprints,
        },
        {
          icon: 'assets/icons/heroicons/outline/shield-check.svg',
          label: 'Leaves',
          route: '/leaves',
          roles: [
            UserRole.ProjectManager,
            UserRole.SectionHead,
            UserRole.TeamLeader,
            UserRole.Owner,
          ],
          permissions: [PermissionCodes.HrLeave.Update, PermissionCodes.HrLeave.Manage],
          children: [
            { label: 'Calendar', route: ROUTE_PATHS.leaveCalendar },
            { label: 'My Leaves', route: ROUTE_PATHS.myLeaves },
            {
              label: 'Members Leaves',
              route: ROUTE_PATHS.membersLeaves,
              roles: [UserRole.Owner],
              permissions: [PermissionCodes.HrLeave.Manage],
            },
            {
              label: 'Holidays',
              route: ROUTE_PATHS.holidays,
              permissions: [PermissionCodes.HrHolidays.Read],
            },
          ],
        },
        {
          icon: 'assets/icons/heroicons/outline/shield-check.svg',
          label: 'My Leaves',
          route: ROUTE_PATHS.myLeaves,
          roles: [UserRole.Member],
          permissions: [PermissionCodes.HrLeave.Create],
        },
        {
          icon: 'assets/icons/heroicons/outline/clock.svg',
          label: 'Forgot clock',
          route: ROUTE_PATHS.forgotClock,
          permissions: [PermissionCodes.HrForgotClock.Read],
        },
      ],
    },
    {
      group: 'Admin',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/users.svg',
          label: 'Resources',
          route: '/resources',
          roles: [UserRole.ProjectManager, UserRole.Owner],
          permissions: [PermissionCodes.IdentityUsers.Read, PermissionCodes.Organization.Read],
          children: [
            { label: 'Users', route: ROUTE_PATHS.users, permissions: [PermissionCodes.IdentityUsers.Read] },
            { label: 'Roles', route: ROUTE_PATHS.roles, permissions: [PermissionCodes.IdentityRoles.Read] },
            { label: 'Teams', route: ROUTE_PATHS.teams, permissions: [PermissionCodes.Organization.Read] },
            { label: 'Sections', route: ROUTE_PATHS.sections, permissions: [PermissionCodes.Organization.Read] },
          ],
        },
        {
          icon: 'assets/icons/heroicons/outline/folder.svg',
          label: 'Curriculum',
          route: ROUTE_PATHS.curriculum,
          roles: [UserRole.ProjectManager, UserRole.Owner],
          permissions: [PermissionCodes.Curriculum.Read],
        },
        {
          icon: 'assets/icons/heroicons/outline/bookmark.svg',
          label: 'Workflows',
          route: '/workflows',
          roles: [UserRole.ProjectManager, UserRole.Owner],
          permissions: [PermissionCodes.Workflows.Read],
          children: [
            { label: 'Schemas', route: ROUTE_PATHS.schemas },
            { label: 'Task bank', route: ROUTE_PATHS.taskBank },
          ],
        },
      ],
    },
  ];
}
