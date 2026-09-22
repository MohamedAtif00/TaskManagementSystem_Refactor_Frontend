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

function toVerbOption(item: PermissionCatalogItem): PermissionVerbOption {
  const verb = permissionVerb(item.code);
  return {
    id: item.id,
    code: item.code,
    name: item.name,
    verb,
    label: verbLabel(verb),
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
    item.label.toLowerCase().includes(needle)
  );
}
