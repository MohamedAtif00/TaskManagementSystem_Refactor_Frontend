import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  expandImpliedSelections,
  groupPermissions,
  isVerbChecked,
  toggleManage,
  toggleVerb,
} from './role-permission-groups.ts';

const catalog = [
  { id: 10, code: 'hr.forgotclock.read', name: 'Read forgot clock' },
  { id: 11, code: 'hr.forgotclock.create', name: 'Create forgot clock' },
  { id: 12, code: 'hr.forgotclock.update', name: 'Update forgot clock' },
  { id: 13, code: 'hr.forgotclock.delete', name: 'Delete forgot clock' },
  { id: 14, code: 'hr.forgotclock.manage', name: 'Manage forgot clock' },
  { id: 20, code: 'notifications.read', name: 'Read notifications' },
  { id: 21, code: 'notifications.update', name: 'Update notifications' },
  { id: 22, code: 'notifications.manage', name: 'Manage notifications' },
];

describe('role-permission-groups', () => {
  const groups = groupPermissions(catalog);
  const forgotClock = groups.find((group) => group.prefix === 'hr.forgotclock')!;
  const notifications = groups.find((group) => group.prefix === 'notifications')!;

  it('groups catalog rows by module prefix', () => {
    assert.equal(forgotClock.label, 'HR Forgotclock');
    assert.equal(forgotClock.manage?.id, 14);
    assert.deepEqual(
      forgotClock.verbs.map((verb) => verb.verb),
      ['read', 'create', 'update', 'delete'],
    );
  });

  it('checking manage selects all CRUD ids', () => {
    const ids = toggleManage([], forgotClock, true);
    assert.deepEqual(
      ids.sort((a, b) => a - b),
      [10, 11, 12, 13, 14],
    );
  });

  it('unchecking manage clears all CRUD ids it marked', () => {
    const selected = toggleManage([], forgotClock, true);
    const ids = toggleManage(selected, forgotClock, false);
    assert.deepEqual(ids, []);
  });

  it('unchecking one CRUD drops manage', () => {
    const selected = toggleManage([], forgotClock, true);
    const read = forgotClock.verbs.find((verb) => verb.verb === 'read')!;
    const ids = toggleVerb(selected, forgotClock, read, false);
    assert.equal(ids.includes(14), false);
    assert.equal(ids.includes(10), false);
    assert.equal(ids.includes(11), true);
    assert.equal(ids.includes(12), true);
    assert.equal(ids.includes(13), true);
  });

  it('treats CRUD as checked when only manage is stored', () => {
    const ids = new Set([14]);
    for (const verb of forgotClock.verbs) {
      assert.equal(isVerbChecked(ids, forgotClock, verb), true);
    }
  });

  it('expands implied CRUD ids on save for manage-only roles', () => {
    assert.deepEqual(
      expandImpliedSelections([14], groups).sort((a, b) => a - b),
      [10, 11, 12, 13, 14],
    );
  });

  it('does not invent missing verbs for notifications', () => {
    assert.deepEqual(
      notifications.verbs.map((verb) => verb.verb),
      ['read', 'update'],
    );
    assert.deepEqual(
      toggleManage([], notifications, true).sort((a, b) => a - b),
      [20, 21, 22],
    );
  });
});
