export interface PermissionCatalogItem {
  id: number;
  code: string;
  name: string;
}

const CRUD_ORDER = ['read', 'create', 'update', 'delete'] as const;

export interface PermissionVerbOption {
  id: number;
  code: string;
  name: string;
  verb: string;
  label: string;
  hint: string;
}

export interface PermissionGroup {
  prefix: string;
  label: string;
  manage?: PermissionVerbOption;
  verbs: PermissionVerbOption[];
}

export function permissionPrefix(code: string): string {
  const lastDot = code.lastIndexOf('.');
  return lastDot <= 0 ? code : code.slice(0, lastDot);
}

export function permissionVerb(code: string): string {
  const lastDot = code.lastIndexOf('.');
  return lastDot <= 0 ? code.toLowerCase() : code.slice(lastDot + 1).toLowerCase();
}

export function humanizePrefix(prefix: string): string {
  return prefix
    .split('.')
    .map((part) => {
      if (part.length <= 2) {
        return part.toUpperCase();
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

export function verbLabel(verb: string): string {
  switch (verb) {
    case 'read':
      return 'Read';
    case 'create':
      return 'Create';
    case 'update':
      return 'Update';
    case 'delete':
      return 'Delete';
    case 'manage':
      return 'Full access';
    default:
      return verb.charAt(0).toUpperCase() + verb.slice(1);
  }
}

const PERMISSION_HINTS: Record<string, string> = {
  'hr.leave.read': 'Opens Leave settings and leave lists. Does not open My Leaves or Approvals by itself.',
  'hr.leave.create': 'Opens My Leaves. Request and track your own leave.',
  'hr.leave.update':
    "Opens Approvals and lets you give an opinion. You must still be Owner, that request's team leader or section head, or Project Manager and not the requester.",
  'hr.leave.delete': 'Not used by any screen.',
  'hr.leave.manage':
    'Opens Approvals and Members Leaves. Final approval and bulk decisions. Final approval still requires the Owner role. Also covers read, create, and update.',
  'hr.timeoff.read': 'View time-off requests.',
  'hr.timeoff.create': 'Request your own time off from My Leaves.',
  'hr.timeoff.update': 'Give an opinion on time-off requests in Approvals. Same role rules as leave opinions.',
  'hr.timeoff.delete': 'Not used by any screen.',
  'hr.timeoff.manage':
    'Final approval and bulk decisions for time off in Approvals. Final approval still requires the Owner role. Also covers read, create, and update.',
  'hr.workfromhome.read': 'View work-from-home requests.',
  'hr.workfromhome.create': 'Request your own work from home from My Leaves.',
  'hr.workfromhome.update': 'Give an opinion on work-from-home requests in Approvals. Same role rules as leave opinions.',
  'hr.workfromhome.delete': 'Not used by any screen.',
  'hr.workfromhome.manage':
    'Final approval and bulk decisions for work from home in Approvals. Final approval still requires the Owner role. Also covers read, create, and update.',
  'hr.forgotclock.read': 'View forgot-clock requests.',
  'hr.forgotclock.create': 'Submit your own forgot-clock request from My Leaves.',
  'hr.forgotclock.update': 'Give an opinion on forgot-clock requests in Approvals. Same role rules as leave opinions.',
  'hr.forgotclock.delete': 'Not used by any screen.',
  'hr.forgotclock.manage':
    'Final approval and bulk decisions for forgot clock in Approvals. Final approval still requires the Owner role. Also covers read, create, and update.',
  'hr.holidays.read': 'Opens the Holidays page.',
  'hr.holidays.create': 'Not checked on its own. Adding holidays uses full access.',
  'hr.holidays.update': 'Not checked on its own. Editing holidays uses full access.',
  'hr.holidays.delete': 'Not checked on its own. Removing holidays uses full access.',
  'hr.holidays.manage': 'Add, edit, and remove holidays. Also covers read.',
  'tickets.read':
    'Opens Kanban and user tasks. On your team, work a task assigned to you or in Backlog: start, complete, pause, flag, timer, and rollback on a review task.',
  'tickets.create': 'Create tasks, add comments, and start or stop the work timer.',
  'tickets.update':
    'Assign people and change priority on tasks you can reach, plus the same work actions as read. The API accepts skip and jump, but only for Owner or Project Manager.',
  'tickets.delete': 'Not used by any screen.',
  'tickets.manage':
    'Shows Skip and Jump on a task. Jump is still limited to Owner and Project Manager. Also covers tasks outside your team, and read, create, and update.',
  'notifications.read': 'Opens Inbox.',
  'notifications.update': 'Mark notifications as read.',
  'notifications.manage': 'Full control of notifications. Also covers read and update.',
  'organization.read': 'Opens Teams and Sections.',
  'organization.create': 'Create teams and sections.',
  'organization.update': 'Edit teams and sections.',
  'organization.delete': 'Archive teams and sections.',
  'organization.manage': 'Full control of teams and sections. Also covers read, create, update, and delete.',
  'identity.users.read': 'Opens the Users page.',
  'identity.users.create': 'Create users.',
  'identity.users.update': 'Edit users.',
  'identity.users.delete': 'Archive users.',
  'identity.users.manage': 'Full control of users. Also covers read, create, update, and delete.',
  'identity.roles.read': 'Opens the Roles page.',
  'identity.roles.create': 'Create roles.',
  'identity.roles.update': 'Edit role descriptions and permissions. System role names stay fixed.',
  'identity.roles.delete': 'Delete custom roles. System roles cannot be deleted.',
  'identity.roles.manage': 'Full control of roles. Also covers read, create, update, and delete.',
  'curriculum.read': 'Opens Projects, Curriculum, and project overview.',
  'curriculum.create': 'Create curriculum items.',
  'curriculum.update': 'Edit curriculum items.',
  'curriculum.delete': 'Archive curriculum items.',
  'curriculum.manage': 'Full control of projects and curriculum. Also covers read, create, update, and delete.',
  'sprints.read': 'Opens Sprints and sprint analytics.',
  'sprints.create': 'Create sprints and add learning objectives.',
  'sprints.update': 'Edit sprints.',
  'sprints.delete': 'Archive sprints and remove learning objectives.',
  'sprints.manage': 'Opens Sprint management and full control of sprints. Also covers read, create, update, and delete.',
  'workflows.read': 'Opens Workflows, including schemas and the task bank.',
  'workflows.create': 'Create workflow schemas, nodes, steps, and task-bank items.',
  'workflows.update': 'Edit workflow schemas, nodes, steps, and task-bank items.',
  'workflows.delete': 'Archive workflow schemas, nodes, steps, and task-bank items.',
  'workflows.manage': 'Full control of workflows. Also covers read, create, update, and delete.',
};

export function permissionHint(code: string): string {
  return PERMISSION_HINTS[code] ?? '';
}

function toVerbOption(item: PermissionCatalogItem): PermissionVerbOption {
  const verb = permissionVerb(item.code);
  return {
    id: item.id,
    code: item.code,
    name: item.name,
    verb,
    label: verbLabel(verb),
    hint: permissionHint(item.code),
  };
}

export function groupPermissions(catalog: readonly PermissionCatalogItem[]): PermissionGroup[] {
  const byPrefix = new Map<string, PermissionCatalogItem[]>();
  for (const item of catalog) {
    const prefix = permissionPrefix(item.code);
    const list = byPrefix.get(prefix) ?? [];
    list.push(item);
    byPrefix.set(prefix, list);
  }

  return [...byPrefix.entries()]
    .map(([prefix, items]) => {
      const mapped = items.map(toVerbOption);
      const manage = mapped.find((item) => item.verb === 'manage');
      const verbs = mapped
        .filter((item) => item.verb !== 'manage')
        .sort((left, right) => {
          const leftIndex = CRUD_ORDER.indexOf(left.verb as (typeof CRUD_ORDER)[number]);
          const rightIndex = CRUD_ORDER.indexOf(right.verb as (typeof CRUD_ORDER)[number]);
          return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
        });
      return { prefix, label: humanizePrefix(prefix), manage, verbs };
    })
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function isManageSelected(ids: ReadonlySet<number>, group: PermissionGroup): boolean {
  return group.manage != null && ids.has(group.manage.id);
}

export function isVerbChecked(ids: ReadonlySet<number>, group: PermissionGroup, verb: PermissionVerbOption): boolean {
  return ids.has(verb.id) || isManageSelected(ids, group);
}

export function toggleManage(ids: readonly number[], group: PermissionGroup, checked: boolean): number[] {
  const next = new Set(ids);
  if (checked) {
    if (group.manage) {
      next.add(group.manage.id);
    }
    for (const verb of group.verbs) {
      next.add(verb.id);
    }
    return [...next];
  }

  if (group.manage) {
    next.delete(group.manage.id);
  }
  for (const verb of group.verbs) {
    next.delete(verb.id);
  }
  return [...next];
}

export function toggleVerb(
  ids: readonly number[],
  group: PermissionGroup,
  verb: PermissionVerbOption,
  checked: boolean,
): number[] {
  const next = new Set(ids);
  if (checked) {
    next.add(verb.id);
    return [...next];
  }

  next.delete(verb.id);
  if (group.manage) {
    next.delete(group.manage.id);
  }
  return [...next];
}

export function expandImpliedSelections(ids: readonly number[], groups: readonly PermissionGroup[]): number[] {
  const next = new Set(ids);
  for (const group of groups) {
    if (!group.manage || !next.has(group.manage.id)) {
      continue;
    }
    for (const verb of group.verbs) {
      next.add(verb.id);
    }
  }
  return [...next];
}

export function filterGroups(groups: readonly PermissionGroup[], query: string): PermissionGroup[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return [...groups];
  }

  return groups.filter((group) => {
    if (group.label.toLowerCase().includes(needle) || group.prefix.toLowerCase().includes(needle)) {
      return true;
    }
    if (group.manage && matchesPermission(group.manage, needle)) {
      return true;
    }
    return group.verbs.some((verb) => matchesPermission(verb, needle));
  });
}

function matchesPermission(item: PermissionVerbOption, needle: string): boolean {
  return (
    item.code.toLowerCase().includes(needle) ||
    item.name.toLowerCase().includes(needle) ||
    item.label.toLowerCase().includes(needle) ||
    item.hint.toLowerCase().includes(needle)
  );
}
