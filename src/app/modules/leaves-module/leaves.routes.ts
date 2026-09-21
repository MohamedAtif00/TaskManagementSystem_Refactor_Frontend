import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { PermissionCodes } from '@core/models/permission-codes';
import { LEAVE_APPROVER_ROLES, UserRole } from '@core/models/user-role';
import { FORGOT_CLOCK_DI_CONTAINER } from './features/forgot-clock-screen/di_container';
import { HOLIDAYS_DI_CONTAINER } from './features/holidays-screen/di_container';
import { LEAVE_CALENDAR_DI_CONTAINER } from './features/leave-calendar-screen/di_container';
import { MEMBERS_LEAVES_DI_CONTAINER } from './features/members-leaves-screen/di_container';
import { MY_LEAVES_DI_CONTAINER } from './features/my-leaves-screen/di_container';

export const LEAVES_ROUTES: Routes = [
  { path: '', redirectTo: 'mine', pathMatch: 'full' },
  {
    path: 'mine',
    canActivate: [roleGuard],
    data: { permissions: [PermissionCodes.HrLeave.Create] },
    providers: MY_LEAVES_DI_CONTAINER,
    loadComponent: () =>
      import('./features/my-leaves-screen/presentation/my-leaves.component').then(
        (m) => m.MyLeavesComponent,
      ),
  },
  {
    path: 'calendar',
    canActivate: [roleGuard],
    data: {
      roles: LEAVE_APPROVER_ROLES,
      permissions: [PermissionCodes.HrLeave.Update, PermissionCodes.HrLeave.Manage],
    },
    providers: LEAVE_CALENDAR_DI_CONTAINER,
    loadComponent: () =>
      import('./features/leave-calendar-screen/presentation/leave-calendar.component').then(
        (m) => m.LeaveCalendarComponent,
      ),
  },
  {
    path: 'members',
    canActivate: [roleGuard],
    data: { roles: [UserRole.Owner], permissions: [PermissionCodes.HrLeave.Manage] },
    providers: MEMBERS_LEAVES_DI_CONTAINER,
    loadComponent: () =>
      import('./features/members-leaves-screen/presentation/members-leaves.component').then(
        (m) => m.MembersLeavesComponent,
      ),
  },
  {
    path: 'members/:userId',
    canActivate: [roleGuard],
    data: { roles: [UserRole.Owner], permissions: [PermissionCodes.HrLeave.Manage] },
    providers: MEMBERS_LEAVES_DI_CONTAINER,
    loadComponent: () =>
      import('./features/members-leaves-screen/presentation/member-leave-history.component').then(
        (m) => m.MemberLeaveHistoryComponent,
      ),
  },
  {
    path: 'holidays',
    canActivate: [roleGuard],
    data: { permissions: [PermissionCodes.HrHolidays.Read] },
    providers: HOLIDAYS_DI_CONTAINER,
    loadComponent: () =>
      import('./features/holidays-screen/presentation/holidays.component').then((m) => m.HolidaysComponent),
  },
  {
    path: 'forgot-clock',
    canActivate: [roleGuard],
    data: { permissions: [PermissionCodes.HrForgotClock.Read] },
    providers: FORGOT_CLOCK_DI_CONTAINER,
    loadComponent: () =>
      import('./features/forgot-clock-screen/presentation/forgot-clock.component').then(
        (m) => m.ForgotClockComponent,
      ),
  },
];
