import { MenuItem } from '../models/menu.model';
import { PermissionCodes } from '../models/permission-codes';
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
          icon: 'assets/icons/heroicons/outline/inbox.svg',
          label: 'Inbox',
          route: ROUTE_PATHS.notifications,
          permissions: [PermissionCodes.Notifications.Read],
          showInNavbar: false,
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
          permissions: [PermissionCodes.Curriculum.Read],
        },
        {
          icon: 'assets/icons/heroicons/outline/view-grid.svg',
          label: 'Kanban',
          route: ROUTE_PATHS.tasks,
          permissions: [PermissionCodes.Tickets.Read],
        },
        {
          icon: 'assets/icons/heroicons/outline/users.svg',
          label: 'User tasks',
          route: ROUTE_PATHS.userTasks,
          permissions: [PermissionCodes.Tickets.Read],
        },
        {
          icon: 'assets/icons/heroicons/outline/bookmark.svg',
          label: 'Sprints',
          route: ROUTE_PATHS.sprints,
          permissions: [PermissionCodes.Sprints.Read],
        },
        {
          icon: 'assets/icons/heroicons/outline/shield-check.svg',
          label: 'Leaves',
          route: '/leaves',
          permissions: [
            PermissionCodes.HrLeave.Read,
            PermissionCodes.HrLeave.Create,
            PermissionCodes.HrLeave.Update,
            PermissionCodes.HrLeave.Manage,
            PermissionCodes.HrHolidays.Read,
          ],
          children: [
            {
              label: 'Approvals',
              route: ROUTE_PATHS.leaveCalendar,
              permissions: [PermissionCodes.HrLeave.Update, PermissionCodes.HrLeave.Manage],
            },
            {
              label: 'My Leaves',
              route: ROUTE_PATHS.myLeaves,
              permissions: [PermissionCodes.HrLeave.Create],
            },
            {
              label: 'Members Leaves',
              route: ROUTE_PATHS.membersLeaves,
              permissions: [PermissionCodes.HrLeave.Manage],
            },
            {
              label: 'Holidays',
              route: ROUTE_PATHS.holidays,
              permissions: [PermissionCodes.HrHolidays.Read],
            },
            {
              label: 'Leave settings',
              route: ROUTE_PATHS.leaveSettings,
              permissions: [PermissionCodes.HrLeave.Read, PermissionCodes.HrLeave.Manage],
            },
          ],
        },
      ],
    },
    {
      group: 'Analytics',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/document-report.svg',
          label: 'Project overview',
          route: `${ROUTE_PATHS.reports}/project-overview`,
          permissions: [PermissionCodes.Curriculum.Read],
        },
        {
          icon: 'assets/icons/heroicons/outline/document-report.svg',
          label: 'Summaries',
          route: `${ROUTE_PATHS.reports}/summaries`,
          permissions: [PermissionCodes.Tickets.Read],
        },
        {
          icon: 'assets/icons/heroicons/outline/view-grid.svg',
          label: 'Kanban analytics',
          route: ROUTE_PATHS.kanbanAnalytics,
          permissions: [PermissionCodes.Tickets.Read],
        },
        {
          icon: 'assets/icons/heroicons/outline/bookmark.svg',
          label: 'Sprint analytics',
          route: ROUTE_PATHS.sprintAnalytics,
          permissions: [PermissionCodes.Sprints.Read],
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
          permissions: [
            PermissionCodes.IdentityUsers.Read,
            PermissionCodes.IdentityRoles.Read,
            PermissionCodes.Organization.Read,
          ],
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
          permissions: [PermissionCodes.Curriculum.Read],
        },
        {
          icon: 'assets/icons/heroicons/outline/bookmark.svg',
          label: 'Sprint management',
          route: ROUTE_PATHS.sprintManage,
          permissions: [PermissionCodes.Sprints.Manage],
        },
        {
          icon: 'assets/icons/heroicons/outline/bookmark.svg',
          label: 'Workflows',
          route: '/workflows',
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
