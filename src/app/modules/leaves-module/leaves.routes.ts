import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { LEAVE_APPROVER_ROLES, UserRole } from '@core/models/user-role';
import { LEAVE_CALENDAR_DI_CONTAINER } from './features/leave-calendar-screen/di_container';
import { MEMBERS_LEAVES_DI_CONTAINER } from './features/members-leaves-screen/di_container';
import { MY_LEAVES_DI_CONTAINER } from './features/my-leaves-screen/di_container';

export const LEAVES_ROUTES: Routes = [
  { path: '', redirectTo: 'mine', pathMatch: 'full' },
  {
    path: 'mine',
    providers: MY_LEAVES_DI_CONTAINER,
    loadComponent: () =>
      import('./features/my-leaves-screen/presentation/my-leaves.component').then(
        (m) => m.MyLeavesComponent,
      ),
  },
  {
    path: 'calendar',
    canActivate: [roleGuard],
    data: { roles: LEAVE_APPROVER_ROLES },
    providers: LEAVE_CALENDAR_DI_CONTAINER,
    loadComponent: () =>
      import('./features/leave-calendar-screen/presentation/leave-calendar.component').then(
        (m) => m.LeaveCalendarComponent,
      ),
  },
  {
    path: 'members',
    canActivate: [roleGuard],
    data: { roles: [UserRole.Owner] },
    providers: MEMBERS_LEAVES_DI_CONTAINER,
    loadComponent: () =>
      import('./features/members-leaves-screen/presentation/members-leaves.component').then(
        (m) => m.MembersLeavesComponent,
      ),
  },
  {
    path: 'members/:userId',
    canActivate: [roleGuard],
    data: { roles: [UserRole.Owner] },
    providers: MEMBERS_LEAVES_DI_CONTAINER,
    loadComponent: () =>
      import('./features/members-leaves-screen/presentation/member-leave-history.component').then(
        (m) => m.MemberLeaveHistoryComponent,
      ),
  },
];
