import { Page, Route } from '@playwright/test';

import { DEMO_USERS, MockUserAccount } from './users';

import * as data from './mock-data';



const API_PREFIXES = [

  '/auth',

  '/hr',

  '/sprints',

  '/tickets',

  '/identity',

  '/curriculum',

  '/subjects',

  '/learning-objectives',

  '/organization',

  '/notifications',

  '/workflows',

];



const MANAGE_PERMISSIONS = [
  'organization.manage',
  'workflows.manage',
  'curriculum.manage',
  'sprints.manage',
  'tickets.manage',
  'notifications.manage',
  'hr.leave.manage',
  'hr.holidays.manage',
  'hr.timeoff.manage',
  'hr.workfromhome.manage',
  'hr.forgotclock.manage',
  'identity.users.manage',
  'identity.roles.manage',
];

const MEMBER_PERMISSIONS = [
  'tickets.read',
  'sprints.read',
  'notifications.read',
  'hr.leave.read',
  'hr.leave.create',
  'hr.timeoff.read',
  'hr.timeoff.create',
  'hr.workfromhome.read',
  'hr.workfromhome.create',
  'hr.forgotclock.read',
  'hr.forgotclock.create',
];

function permissionsForRole(role: number): string[] {
  if (role === 4) {
    return MANAGE_PERMISSIONS;
  }
  if (role === 0) {
    return [
      ...MANAGE_PERMISSIONS.filter((code) => !code.startsWith('hr.leave.manage') && !code.startsWith('hr.holidays.manage')),
      'notifications.read',
      'hr.leave.read',
      'hr.leave.create',
      'hr.leave.update',
      'hr.holidays.read',
      'hr.timeoff.read',
      'hr.timeoff.create',
      'hr.timeoff.update',
      'hr.workfromhome.read',
      'hr.workfromhome.create',
      'hr.workfromhome.update',
      'hr.forgotclock.read',
      'hr.forgotclock.create',
      'hr.forgotclock.update',
    ];
  }
  if (role === 3) {
    return MEMBER_PERMISSIONS;
  }
  return [
    ...MEMBER_PERMISSIONS,
    'tickets.update',
    'hr.leave.update',
    'hr.timeoff.update',
    'hr.workfromhome.update',
    'hr.forgotclock.update',
  ];
}

  return API_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

}



function json(route: Route, body: unknown, status = 200): Promise<void> {

  return route.fulfill({

    status,

    contentType: 'application/json',

    body: JSON.stringify(body),

  });

}



function cloneTickets() {

  return [...data.subjectTickets, ...data.sprintTickets].map((ticket) => ({ ...ticket }));

}



function pagedTickets(tickets: typeof data.subjectTickets, url: URL) {

  const statuses = url.searchParams.getAll('status').map(Number).filter((value) => Number.isFinite(value));

  const learningObjectiveId = Number(url.searchParams.get('learningObjectiveId') ?? 0);

  const name = (url.searchParams.get('name') ?? '').trim().toLowerCase();

  let filtered = [...tickets];

  if (statuses.length) {

    filtered = filtered.filter((ticket) => statuses.includes(ticket.status));

  }

  if (learningObjectiveId) {

    filtered = filtered.filter((ticket) => ticket.learningObjectiveId === learningObjectiveId);

  }

  if (name) {

    filtered = filtered.filter((ticket) => ticket.name.toLowerCase().includes(name));

  }

  const pageParam = url.searchParams.get('page');

  if (!pageParam) {

    return filtered;

  }

  const page = Math.max(1, Number(pageParam) || 1);

  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize')) || 20));

  const start = (page - 1) * pageSize;

  return {

    items: filtered.slice(start, start + pageSize),

    page,

    pageSize,

    totalCount: filtered.length,

  };

}



export async function setupApiMocks(page: Page): Promise<void> {

  let sessionUser: MockUserAccount | null = null;

  const tickets = cloneTickets();

  let nextProjectId = 10;

  let nextTeamId = 10;



  function findTicket(id: number) {

    return tickets.find((ticket) => ticket.id === id);

  }



  await page.route('**/*', async (route) => {

    const resourceType = route.request().resourceType();

    if (resourceType !== 'fetch' && resourceType !== 'xhr') {

      await route.continue();

      return;

    }



    const url = new URL(route.request().url());

    const { pathname } = url;

    const method = route.request().method();



    if (!isApiPath(pathname)) {

      await route.continue();

      return;

    }



    if (method === 'POST' && pathname === '/auth/login') {

      const body = route.request().postDataJSON() as { code?: string };

      const code = (body.code ?? '').trim().toUpperCase();

      const user = DEMO_USERS[code];

      if (!user) {

        await json(route, { detail: 'Invalid employee code' }, 401);

        return;

      }

      sessionUser = user;

      await json(route, { accessToken: user.token });

      return;

    }



    if (method === 'POST' && pathname === '/auth/about-me') {

      const user = sessionUser ?? DEMO_USERS.TST001;

      await json(route, {

        id: user.id,

        name: user.name,

        role: user.role,

        roleName: user.roleName,

        group: user.group,

        permissions: permissionsForRole(user.role),

        notifications: user.role === 4 ? 2 : 0,

      });

      return;

    }



    if (method === 'POST' && pathname === '/auth/logout') {

      sessionUser = null;

      await json(route, {});

      return;

    }



    if (method === 'GET' && pathname === '/curriculum/years') {

      await json(route, data.years);

      return;

    }



    if (method === 'GET' && /^\/curriculum\/years\/\d+\/tree$/.test(pathname)) {

      await json(route, data.yearTree);

      return;

    }



    if (method === 'GET' && pathname === '/identity/users') {

      await json(route, data.users);

      return;

    }



    if (method === 'GET' && pathname === '/identity/roles') {

      await json(route, data.roles);

      return;

    }



    if (method === 'GET' && pathname === '/identity/permissions') {

      await json(route, data.permissions);

      return;

    }



    if (method === 'GET' && /^\/identity\/roles\/\d+$/.test(pathname)) {

      const id = Number(pathname.split('/').pop());

      const role = data.roleRows.find((row) => row.id === id) ?? data.roleRows[0];

      await json(route, role);

      return;

    }



    if (method === 'GET' && pathname === '/organization/teams') {

      await json(route, data.teams);

      return;

    }



    if (method === 'GET' && /^\/organization\/teams\/\d+$/.test(pathname)) {

      const id = Number(pathname.split('/').pop());

      await json(route, data.teamDetails[id] ?? { id, name: 'Team', members: [] });

      return;

    }



    if (method === 'POST' && pathname === '/organization/teams') {

      const body = route.request().postDataJSON() as { name?: string };

      await json(route, { id: nextTeamId++, name: body.name ?? 'New team', members: [] }, 201);

      return;

    }



    if (method === 'PUT' && /^\/organization\/teams\/\d+$/.test(pathname)) {

      const id = Number(pathname.split('/').pop());

      const body = route.request().postDataJSON() as { name?: string };

      await json(route, { id, name: body.name ?? 'Team', members: data.teamDetails[id]?.members ?? [] });

      return;

    }



    if (method === 'GET' && pathname === '/organization/sections') {

      await json(route, data.sections);

      return;

    }



    if (method === 'GET' && /^\/organization\/sections\/\d+$/.test(pathname)) {

      await json(route, data.sectionDetail);

      return;

    }



    if (method === 'GET' && /^\/identity\/users\/\d+$/.test(pathname)) {

      const id = Number(pathname.split('/').pop());

      const user = data.users.find((row) => row.id === id) ?? data.users[0];

      await json(route, {

        ...user,

        email: null,

        phone: null,

        title: null,

      });

      return;

    }



    if (method === 'PUT' && /^\/identity\/users\/\d+$/.test(pathname)) {

      const id = Number(pathname.split('/').pop());

      const body = route.request().postDataJSON() as Record<string, unknown>;

      const user = data.users.find((row) => row.id === id) ?? data.users[0];

      await json(route, { ...user, ...body, id });

      return;

    }



    if (method === 'POST' && /^\/curriculum\/years\/\d+\/projects$/.test(pathname)) {

      const body = route.request().postDataJSON() as { name?: string; description?: string };

      await json(route, { id: nextProjectId++, name: body.name ?? 'New Project', description: body.description ?? '' }, 201);

      return;

    }



    if (method === 'PUT' && /^\/curriculum\/projects\/\d+$/.test(pathname)) {

      const id = Number(pathname.split('/').pop());

      const body = route.request().postDataJSON() as { name?: string; description?: string };

      await json(route, { id, name: body.name ?? 'Updated Project', description: body.description ?? '' });

      return;

    }



    if (method === 'DELETE' && /^\/curriculum\/projects\/\d+$/.test(pathname)) {

      await json(route, {});

      return;

    }



    if (method === 'POST' && pathname === '/curriculum/years') {

      await json(route, { id: 99, name: '2027', description: 'New year' }, 201);

      return;

    }



    if (method === 'GET' && pathname === '/sprints') {

      const archived = url.searchParams.get('archived') === 'true';

      const rows = data.sprints.filter((sprint) => (archived ? sprint.id === 3 : sprint.id !== 3));

      await json(route, rows.length ? rows : data.sprints.filter((sprint) => sprint.id !== 3));

      return;

    }



    if (method === 'GET' && /^\/sprints\/\d+$/.test(pathname)) {

      const id = Number(pathname.split('/').pop());

      const sprint = data.sprints.find((row) => row.id === id) ?? data.sprints[0];

      await json(route, sprint);

      return;

    }



    if (method === 'GET' && /^\/sprints\/\d+\/learning-objectives$/.test(pathname)) {

      const id = Number(pathname.split('/')[2]);

      const sprint = data.sprints.find((row) => row.id === id) ?? data.sprints[0];

      await json(route, sprint.learningObjectiveIds);

      return;

    }



    if (method === 'GET' && /^\/sprints\/\d+\/tickets$/.test(pathname)) {

      await json(route, pagedTickets(data.sprintTickets, url));

      return;

    }



    if (method === 'GET' && pathname === '/workflows/schemas') {

      await json(route, data.schemas);

      return;

    }



    if (method === 'GET' && pathname === '/workflows/schema-types') {

      await json(route, data.schemaTypes);

      return;

    }



    if (method === 'GET' && pathname === '/workflows/task-bank') {

      await json(route, data.taskBank);

      return;

    }



    if (method === 'POST' && pathname === '/workflows/task-bank') {

      await json(route, { id: 99, name: 'New task bank item' }, 201);

      return;

    }



    if (method === 'GET' && /^\/subjects\/\d+\/tickets$/.test(pathname)) {

      await json(route, pagedTickets(data.subjectTickets, url));

      return;

    }



    if (method === 'GET' && /^\/curriculum\/subjects\/\d+$/.test(pathname)) {

      await json(route, { id: 11, name: 'Algebra' });

      return;

    }



    if (method === 'GET' && /^\/curriculum\/subjects\/\d+\/users$/.test(pathname)) {

      await json(route, data.subjectUsers);

      return;

    }



    if (method === 'GET' && /^\/curriculum\/subjects\/\d+\/units$/.test(pathname)) {

      await json(route, data.subjectUnits);

      return;

    }



    if (method === 'GET' && /^\/curriculum\/units\/\d+\/lessons$/.test(pathname)) {

      await json(route, data.unitLessons);

      return;

    }



    if (method === 'GET' && /^\/curriculum\/lessons\/\d+\/learning-objectives$/.test(pathname)) {

      await json(route, data.lessonLos);

      return;

    }



    if (method === 'GET' && /^\/curriculum\/learning-objectives\/\d+$/.test(pathname)) {

      await json(route, data.learningObjective);

      return;

    }



    if (method === 'GET' && pathname === '/tickets/stats') {

      await json(route, {

        tickets: tickets.map((ticket) => ({

          id: ticket.id,

          status: ticket.status,

          userId: ticket.userId ?? null,

          learningObjectiveId: ticket.learningObjectiveId,

          subjectId: ticket.subjectId ?? 1,

        })),

        learningObjectives: [],

      });

      return;

    }



    if (method === 'GET' && pathname === '/notifications') {

      await json(route, { items: [], page: 1, pageSize: 50, totalCount: 0 });

      return;

    }



    if (method === 'PATCH' && pathname === '/notifications/read-all') {

      await json(route, {}, 204);

      return;

    }



    if (method === 'GET' && pathname === '/hr/holidays') {

      await json(route, []);

      return;

    }



    if (method === 'GET' && pathname === '/hr/forgot-clock') {

      await json(route, []);

      return;

    }



    if (method === 'GET' && pathname === '/identity/users/team-leaders') {

      await json(route, data.users.filter((user) => user.roleId === 1 || user.roleId === 2).map((user) => ({ id: user.id, name: user.name })));

      return;

    }



    if (method === 'GET' && /^\/tickets\/\d+$/.test(pathname)) {

      const id = Number(pathname.split('/').pop());

      const ticket = findTicket(id);

      await json(route, ticket ?? data.subjectTickets[0]);

      return;

    }



    if (method === 'PATCH' && /^\/tickets\/\d+\/proceed$/.test(pathname)) {

      const id = Number(pathname.split('/')[2]);

      const ticket = findTicket(id);

      if (ticket && ticket.status < 3) {

        ticket.status = ticket.status === 0 ? 1 : ticket.status === 1 ? 2 : ticket.status;

      }

      await json(route, ticket ?? data.subjectTickets[0]);

      return;

    }



    if (method === 'PATCH' && /^\/tickets\/\d+\/complete$/.test(pathname)) {

      const id = Number(pathname.split('/')[2]);

      const ticket = findTicket(id);

      if (ticket) {

        ticket.status = 3;

      }

      await json(route, ticket ?? data.subjectTickets[0]);

      return;

    }



    if (method === 'PATCH' && /^\/tickets\/\d+\/flag$/.test(pathname)) {

      const id = Number(pathname.split('/')[2]);

      const ticket = findTicket(id);

      if (ticket) {

        ticket.flagged = !ticket.flagged;

      }

      await json(route, ticket ?? data.subjectTickets[0]);

      return;

    }



    if (method === 'PATCH' && /^\/tickets\/\d+\/rollback$/.test(pathname)) {

      const id = Number(pathname.split('/')[2]);

      const ticket = findTicket(id);

      if (ticket) {

        ticket.isRollback = true;

        ticket.rollbackCount = (ticket.rollbackCount ?? 0) + 1;

        if (ticket.status > 0) {

          ticket.status -= 1;

        }

      }

      await json(route, ticket ?? data.subjectTickets[0]);

      return;

    }



    if (method === 'GET' && /^\/tickets\/\d+\/comments$/.test(pathname)) {

      await json(route, []);

      return;

    }



    if (method === 'POST' && pathname === '/tickets') {

      await json(route, {

        id: 99,

        name: 'New mocked task',

        status: 0,

        priority: 2,

        createdAt: new Date().toISOString(),

        learningObjectiveId: 101,

        userId: 5,

        pause: false,

        attention: false,

        flagged: false,

        isRollback: false,

        rollbackCount: 0,

      }, 201);

      return;

    }



    if (method === 'GET' && pathname === '/hr/leave/balances') {

      await json(route, data.leaveBalances);

      return;

    }



    if (method === 'GET' && /^\/hr\/leave\/balances\/\d+$/.test(pathname)) {

      await json(route, data.leaveBalances);

      return;

    }



    if (method === 'GET' && pathname === '/hr/leave/leave-requests') {

      await json(route, data.leaveRequests);

      return;

    }



    if (method === 'GET' && pathname === '/hr/permissions') {

      await json(route, data.permissionRequests);

      return;

    }



    if (method === 'GET' && pathname === '/hr/work-from-home') {

      await json(route, data.wfhRequests);

      return;

    }



    if (method === 'GET' && pathname === '/hr/leave/leave-requests/pending') {

      await json(route, data.leaveRequests.filter((row) => row.status === 'Pending'));

      return;

    }



    if (method === 'GET' && pathname === '/hr/permissions/pending') {

      await json(route, data.permissionRequests.filter((row) => row.status === 'Pending'));

      return;

    }



    if (method === 'GET' && pathname === '/hr/work-from-home/pending') {

      await json(route, data.wfhRequests.filter((row) => row.status === 'Pending'));

      return;

    }



    if (method === 'GET' && pathname.startsWith('/hr/leave/leave-requests/search')) {

      await json(route, { items: data.leaveRequests, totalCount: data.leaveRequests.length });

      return;

    }



    if (method === 'GET' && pathname.startsWith('/hr/permissions/search')) {

      await json(route, { items: data.permissionRequests, totalCount: data.permissionRequests.length });

      return;

    }



    if (method === 'GET' && pathname.startsWith('/hr/work-from-home/search')) {

      await json(route, { items: data.wfhRequests, totalCount: data.wfhRequests.length });

      return;

    }



    if (method === 'POST' && pathname === '/identity/users') {

      await json(route, { id: 99, name: 'New User', hrCode: 'NEW001' }, 201);

      return;

    }



    if (method === 'POST' && pathname.startsWith('/hr/')) {

      await json(route, {}, 201);

      return;

    }



    if (method === 'GET') {

      await json(route, []);

      return;

    }



    if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {

      await json(route, {});

      return;

    }



    await route.continue();

  });

}


