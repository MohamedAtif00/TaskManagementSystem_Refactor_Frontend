import { Injectable } from '@angular/core';
import { MOCK_PUBLIC_HOLIDAYS } from '@core/hr/mock-holidays';
import { countWorkingDays } from '@core/hr/working-days';
import { loCodeSeedRows } from '@core/lo-code/lo-code.seed';
import { tryParseLoCode } from '@core/lo-code/lo-code.parser';

export type TaskStatus = 0 | 1 | 2 | 3 | 4;
export type TaskPriority = 0 | 1 | 2 | 3;

export interface MockIdName {
  id: number;
  name: string;
}

export interface MockSubject {
  id: number;
  name: string;
  folderPath: string;
  year: string;
  term: string;
  status: string;
}

export interface MockLo {
  id: number;
  name: string;
  subjectId: number;
  unitId: number;
  unitName: string;
  lessonId: number;
  lessonName: string;
  tag: string;
  template: string;
  environment: string;
  schemaName: string;
}

export interface MockLeaveBalance {
  annualUsed: number;
  annualMax: number;
  sickUsed: number;
  emergencyUsed: number;
  emergencyMax: number;
  permissionUsed: number;
  permissionMax: number;
  wfhUsed: number;
  wfhMax: number;
  fromNextUsed: number;
  fromNextMax: number;
}

export interface MockUser {
  id: number;
  name: string;
  code: string;
  balances: MockLeaveBalance;
  email?: string;
  phone?: string;
  title?: string;
  roleId: number;
  roleName: string;
  teamId?: number | null;
  teamName?: string | null;
  accountType: number;
  archived?: boolean;
}

export interface MockPermission {
  id: number;
  code: string;
  name: string;
  description?: string;
  isSystem: boolean;
}

export interface MockRole {
  id: number;
  name: string;
  description?: string;
  isSystem: boolean;
  permissionIds: number[];
}

export interface MockTeam {
  id: number;
  name: string;
  archived?: boolean;
  teamleaderId?: number | null;
}

export interface MockSection {
  id: number;
  name: string;
  headId: number;
  teamIds: number[];
  archived?: boolean;
}

export interface MockTask {
  id: number;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  subjectId: number;
  sprintIds: number[];
  user?: MockIdName;
  learningObjective: MockIdName;
  flagged: boolean;
  attention: boolean;
  paused: boolean;
  isRollback: boolean;
  rollbackCount: number;
  createdAt: string;
  startedAt: string | null;
  doneAt: string | null;
}

export interface MockSprint {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isArchived: boolean;
  learningObjectIds: number[];
}

export interface MockSheetTask {
  id: number;
  name: string;
  status: TaskStatus;
  user?: MockIdName;
  flagged: boolean;
  paused: boolean;
  isRollback: boolean;
}

export interface MockSheetLo {
  id: number;
  name: string;
  tag: string;
  template: string;
  environment: string;
  schemaName: string;
  tasks: MockSheetTask[];
}

export interface MockSheetLesson {
  id: number;
  name: string;
  learningObjectives: MockSheetLo[];
}

export interface MockSheetUnit {
  id: number;
  name: string;
  lessons: MockSheetLesson[];
}

export interface MockProjectSheet {
  id: number;
  name: string;
  units: MockSheetUnit[];
  users: MockIdName[];
}

export interface CreateSprintInput {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  learningObjectIds: number[];
}

export interface CreateTaskInput {
  subjectId: number;
  name: string;
  learningObjectiveId: number;
  userId?: number;
}

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
export type LeaveType = 'Annual' | 'Sick' | 'Emergency' | 'UnpaidLeave';
export type PermissionType = 'EarlyDeparture' | 'LateArrival' | 'WorkAssignment' | 'Departure';

export interface MockLeaveRequest {
  id: number;
  userId: number;
  type: LeaveType;
  startDate: string;
  endDate: string;
  duration: number;
  reason?: string;
  status: LeaveStatus;
  dateCreated: string;
  comment?: string;
}

export interface MockPermissionRequest {
  id: number;
  userId: number;
  type: PermissionType;
  permissionDate: string;
  fromTime: string;
  toTime: string;
  duration: number;
  reason?: string;
  status: LeaveStatus;
  dateCreated: string;
  comment?: string;
}

export interface MockWfhRequest {
  id: number;
  userId: number;
  date: string;
  note?: string;
  status: LeaveStatus;
  dateCreated: string;
  comment?: string;
}

export interface LeaveListFilters {
  userId?: number;
  status?: LeaveStatus | '';
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateLeaveInput {
  userId: number;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface CreatePermissionInput {
  userId: number;
  type: PermissionType;
  permissionDate: string;
  fromTime: string;
  toTime: string;
  reason?: string;
}

export interface CreateWfhInput {
  userId: number;
  date: string;
  note?: string;
}

const SEEDED_CURRICULUM = (() => {
  const rows = loCodeSeedRows();
  const subjects: MockSubject[] = [];
  const learningObjectives: MockLo[] = [];
  const subjectIds = new Map<string, number>();
  let nextSubjectId = 16;
  let nextLoId = 2000;

  for (const row of rows) {
    const key = `${row.subject}|${row.termName}`;
    if (!subjectIds.has(key)) {
      const parsed = tryParseLoCode(row.code);
      const year = parsed?.year != null ? String(parsed.year) : '2026';
      const id = nextSubjectId++;
      subjectIds.set(key, id);
      subjects.push({
        id,
        name: row.subject,
        folderPath: `${year} / ${row.termName} / ${row.subjectGroup}`,
        year,
        term: row.termName,
        status: 'Running',
      });
    }

    const parsed = tryParseLoCode(row.code);
    learningObjectives.push({
      id: nextLoId++,
      name: row.code,
      subjectId: subjectIds.get(key)!,
      unitId: 700 + (parsed?.unit ?? 1),
      unitName: row.unitName,
      lessonId: 800 + (parsed?.unit ?? 1) * 20 + (parsed?.lesson ?? 1),
      lessonName: row.lessonName,
      tag: row.subjectCode.toUpperCase(),
      template: 'default',
      environment: 'Web',
      schemaName: row.subjectGroup,
    });
  }

  return { subjects, learningObjectives };
})();

const DEFAULT_BALANCES = (): MockLeaveBalance => ({
  annualUsed: 0,
  annualMax: 21,
  sickUsed: 0,
  emergencyUsed: 0,
  emergencyMax: 7,
  permissionUsed: 0,
  permissionMax: 12,
  wfhUsed: 0,
  wfhMax: 8,
  fromNextUsed: 0,
  fromNextMax: 5,
});

@Injectable({ providedIn: 'root' })
export class TmsMockStore {
  permissions: MockPermission[] = [
    { id: 1, code: 'identity.users.read', name: 'Read users', isSystem: true },
    { id: 2, code: 'identity.users.manage', name: 'Manage users', isSystem: true },
    { id: 3, code: 'identity.roles.read', name: 'Read roles', isSystem: true },
    { id: 4, code: 'identity.roles.manage', name: 'Manage roles', isSystem: true },
    { id: 5, code: 'organization.read', name: 'Read organization', isSystem: true },
    { id: 6, code: 'organization.manage', name: 'Manage organization', isSystem: true },
  ];

  roles: MockRole[] = [
    { id: 0, name: 'Project Manager', description: 'PMO', isSystem: true, permissionIds: [1, 2, 3, 5] },
    { id: 1, name: 'Section Head', description: 'Section', isSystem: true, permissionIds: [1, 3, 5] },
    { id: 2, name: 'Team Leader', description: 'Team', isSystem: true, permissionIds: [1, 5] },
    { id: 3, name: 'Member', description: 'Contributor', isSystem: true, permissionIds: [1, 5] },
    { id: 4, name: 'Owner', description: 'Full access', isSystem: true, permissionIds: [1, 2, 3, 4, 5, 6] },
  ];

  teams: MockTeam[] = [
    { id: 1, name: 'Leadership' },
    { id: 2, name: 'PMO' },
    { id: 3, name: 'Math Team' },
    { id: 4, name: 'Science Team' },
  ];

  sections: MockSection[] = [
    { id: 1, name: 'Math Section', headId: 4, teamIds: [3] },
    { id: 2, name: 'Science Section', headId: 4, teamIds: [4] },
  ];

  users: MockUser[] = [
    { id: 1, name: 'Omar Owner', code: 'OWN001', roleId: 4, roleName: 'Owner', teamId: 1, teamName: 'Leadership', accountType: 0, balances: { ...DEFAULT_BALANCES(), annualUsed: 4, permissionUsed: 1 } },
    { id: 2, name: 'Paula Manager', code: 'PM001', roleId: 0, roleName: 'Project Manager', teamId: 2, teamName: 'PMO', accountType: 0, balances: { ...DEFAULT_BALANCES(), annualUsed: 6, sickUsed: 2 } },
    { id: 3, name: 'Tarek Leader', code: 'TL001', roleId: 2, roleName: 'Team Leader', teamId: 3, teamName: 'Math Team', accountType: 0, balances: { ...DEFAULT_BALANCES(), annualUsed: 5, emergencyUsed: 1, permissionUsed: 4, wfhUsed: 2 } },
    { id: 4, name: 'Sara Head', code: 'SH001', roleId: 1, roleName: 'Section Head', teamId: 4, teamName: 'Science Team', accountType: 0, balances: { ...DEFAULT_BALANCES(), annualUsed: 2, wfhUsed: 1 } },
    { id: 5, name: 'Mona Member', code: 'MEM001', roleId: 3, roleName: 'Member', teamId: 3, teamName: 'Math Team', accountType: 0, balances: { ...DEFAULT_BALANCES(), annualUsed: 3, sickUsed: 1, permissionUsed: 2, wfhUsed: 1 } },
    { id: 6, name: 'Karim Member', code: 'MEM002', roleId: 3, roleName: 'Member', teamId: 4, teamName: 'Science Team', accountType: 0, balances: { ...DEFAULT_BALANCES(), annualUsed: 1 } },
  ];

  readonly subjects: MockSubject[] = [
    { id: 11, name: 'Algebra', folderPath: '2026 / Term 1 / Math', year: '2026', term: 'Term 1', status: 'Running' },
    { id: 12, name: 'Geometry', folderPath: '2026 / Term 1 / Math', year: '2026', term: 'Term 1', status: 'Idle' },
    { id: 13, name: 'Physics', folderPath: '2026 / Term 1 / Science', year: '2026', term: 'Term 1', status: 'Running' },
    { id: 14, name: 'Chemistry', folderPath: '2026 / Term 2 / Science', year: '2026', term: 'Term 2', status: 'Done' },
    { id: 15, name: 'Arabic', folderPath: '2025 / Term 1 / Languages', year: '2025', term: 'Term 1', status: 'Closed' },
    ...SEEDED_CURRICULUM.subjects,
  ];

  readonly learningObjectives: MockLo[] = [
    {
      id: 101,
      name: 'Mth_5R_1A_01_04_02',
      subjectId: 11,
      unitId: 1,
      unitName: 'Unit 1',
      lessonId: 11,
      lessonName: 'Lesson 4',
      tag: 'MTH',
      template: 'Interactive',
      environment: 'Web',
      schemaName: 'Math',
    },
    {
      id: 102,
      name: 'Mth_5R_1A_01_04_03',
      subjectId: 11,
      unitId: 1,
      unitName: 'Unit 1',
      lessonId: 11,
      lessonName: 'Lesson 4',
      tag: 'MTH',
      template: 'Worksheet',
      environment: 'Web',
      schemaName: 'Math',
    },
    {
      id: 103,
      name: 'Mth_5R_1A_01_05_01',
      subjectId: 11,
      unitId: 1,
      unitName: 'Unit 1',
      lessonId: 12,
      lessonName: 'Lesson 5',
      tag: 'MTH',
      template: 'Interactive',
      environment: 'Web',
      schemaName: 'Math',
    },
    {
      id: 104,
      name: 'Mth_5R_1A_02_01_01',
      subjectId: 11,
      unitId: 2,
      unitName: 'Unit 2',
      lessonId: 21,
      lessonName: 'Lesson 1',
      tag: 'MTH',
      template: 'Quiz',
      environment: 'Web',
      schemaName: 'Math',
    },
    {
      id: 201,
      name: 'Sci_5R_1A_04_03_05',
      subjectId: 13,
      unitId: 31,
      unitName: 'Unit 4',
      lessonId: 311,
      lessonName: 'Lesson 3',
      tag: 'SCI',
      template: 'Notes',
      environment: 'Lab',
      schemaName: 'Science',
    },
    {
      id: 202,
      name: 'Sci_5R_1A_04_03_06',
      subjectId: 13,
      unitId: 31,
      unitName: 'Unit 4',
      lessonId: 311,
      lessonName: 'Lesson 3',
      tag: 'SCI',
      template: 'Interactive',
      environment: 'Lab',
      schemaName: 'Science',
    },
    {
      id: 301,
      name: 'Mth_5R_1A_03_01_01',
      subjectId: 12,
      unitId: 41,
      unitName: 'Unit 3',
      lessonId: 411,
      lessonName: 'Lesson 1',
      tag: 'MTH',
      template: 'Proof',
      environment: 'Web',
      schemaName: 'Math',
    },
    {
      id: 401,
      name: 'Sci_5R_2A_01_01_01',
      subjectId: 14,
      unitId: 51,
      unitName: 'Unit 1',
      lessonId: 511,
      lessonName: 'Lesson 1',
      tag: 'SCI',
      template: 'Checklist',
      environment: 'Lab',
      schemaName: 'Science',
    },
    {
      id: 501,
      name: 'Ara_5R_1A_01_01_04',
      subjectId: 15,
      unitId: 61,
      unitName: 'Unit 1',
      lessonId: 611,
      lessonName: 'Lesson 1',
      tag: 'ARA',
      template: 'Passage',
      environment: 'Web',
      schemaName: 'Arabic',
    },
    ...SEEDED_CURRICULUM.learningObjectives,
  ];

  sprints: MockSprint[] = [
    {
      id: 1,
      name: 'Algebra Sprint',
      description: 'Linear and quadratic coverage for Term 1.',
      startDate: '2026-09-01',
      endDate: '2026-09-14',
      isArchived: false,
      learningObjectIds: [101, 102, 103],
    },
    {
      id: 2,
      name: 'Physics Burst',
      description: 'Kinematics cards for the science section.',
      startDate: '2026-09-08',
      endDate: '2026-09-21',
      isArchived: false,
      learningObjectIds: [201, 202],
    },
    {
      id: 3,
      name: 'Archive Pilot',
      description: 'Closed polynomial trial.',
      startDate: '2026-08-01',
      endDate: '2026-08-10',
      isArchived: true,
      learningObjectIds: [104],
    },
  ];

  tasks: MockTask[] = [
    this.card(1, 'Draft linear worksheet', 0, 2, 11, [1], 5, 101, false, false),
    this.card(2, 'Review linear quiz', 1, 3, 11, [1], 5, 101, true, false),
    this.card(3, 'Record linear video', 2, 3, 11, [1], 5, 101, false, false, '2026-09-10T08:00:00Z'),
    this.card(4, 'Publish linear pack', 3, 1, 11, [1], 3, 101, false, false, '2026-09-08T08:00:00Z', '2026-09-12T08:00:00Z'),
    this.card(5, 'Graphing activity', 1, 2, 11, [1], 5, 102, false, false),
    this.card(6, 'Quadratic intro slides', 0, 0, 11, [1], 2, 103, false, false),
    this.card(7, 'Factoring drill', 2, 2, 11, [1], 3, 103, false, true, '2026-09-11T08:00:00Z'),
    this.card(8, 'Polynomial sort', 4, 1, 11, [3], 5, 104, false, false, '2026-08-03T08:00:00Z', '2026-08-06T08:00:00Z', true, 1),
    this.card(9, 'Velocity notes', 0, 1, 13, [2], undefined, 201, false, false),
    this.card(10, 'Motion lab setup', 1, 2, 13, [2], 6, 201, false, false),
    this.card(11, 'Graph analysis', 2, 3, 13, [2], 3, 202, true, false, '2026-09-12T08:00:00Z'),
    this.card(12, 'Kinematics unit test', 3, 1, 13, [2], 4, 202, false, false, '2026-09-09T08:00:00Z', '2026-09-13T08:00:00Z'),
    this.card(13, 'Angle proof sheet', 1, 2, 12, [], 3, 301, false, false),
    this.card(14, 'Lab safety brief', 0, 0, 14, [], undefined, 401, false, false),
    this.card(15, 'Reading passage', 2, 1, 15, [], 5, 501, false, false, '2026-09-07T08:00:00Z'),
    this.card(16, 'Linear warmup', 3, 0, 11, [1], 5, 102, false, false, '2026-09-05T08:00:00Z', '2026-09-09T08:00:00Z'),
  ];

  private nextSprintId = 4;
  private nextTaskId = 17;
  private nextLeaveId = 8;
  private nextPermissionId = 5;
  private nextWfhId = 5;

  leaveRequests: MockLeaveRequest[] = [
    {
      id: 1,
      userId: 5,
      type: 'Annual',
      startDate: '2026-09-20',
      endDate: '2026-09-22',
      duration: 3,
      reason: 'Family visit',
      status: 'Pending',
      dateCreated: '2026-09-12',
    },
    {
      id: 2,
      userId: 5,
      type: 'Sick',
      startDate: '2026-09-05',
      endDate: '2026-09-05',
      duration: 1,
      reason: 'Flu',
      status: 'Approved',
      dateCreated: '2026-09-04',
    },
    {
      id: 3,
      userId: 5,
      type: 'Emergency',
      startDate: '2026-08-20',
      endDate: '2026-08-20',
      duration: 1,
      status: 'Cancelled',
      dateCreated: '2026-08-18',
    },
    {
      id: 4,
      userId: 3,
      type: 'Annual',
      startDate: '2026-10-01',
      endDate: '2026-10-03',
      duration: 3,
      reason: 'Trip',
      status: 'Pending',
      dateCreated: '2026-09-14',
    },
    {
      id: 5,
      userId: 4,
      type: 'Annual',
      startDate: '2026-09-08',
      endDate: '2026-09-09',
      duration: 2,
      status: 'Approved',
      dateCreated: '2026-09-01',
    },
    {
      id: 6,
      userId: 6,
      type: 'UnpaidLeave',
      startDate: '2026-09-28',
      endDate: '2026-09-29',
      duration: 2,
      reason: 'Personal',
      status: 'Pending',
      dateCreated: '2026-09-15',
    },
    {
      id: 7,
      userId: 2,
      type: 'Sick',
      startDate: '2026-09-18',
      endDate: '2026-09-18',
      duration: 1,
      status: 'Rejected',
      dateCreated: '2026-09-16',
      comment: 'Cover already planned',
    },
  ];

  permissionRequests: MockPermissionRequest[] = [
    {
      id: 1,
      userId: 5,
      type: 'EarlyDeparture',
      permissionDate: '2026-09-18',
      fromTime: '14:00',
      toTime: '16:00',
      duration: 2,
      reason: 'Appointment',
      status: 'Pending',
      dateCreated: '2026-09-15',
    },
    {
      id: 2,
      userId: 3,
      type: 'LateArrival',
      permissionDate: '2026-09-10',
      fromTime: '09:00',
      toTime: '10:00',
      duration: 1,
      status: 'Approved',
      dateCreated: '2026-09-09',
    },
    {
      id: 3,
      userId: 1,
      type: 'WorkAssignment',
      permissionDate: '2026-09-21',
      fromTime: '11:00',
      toTime: '13:00',
      duration: 2,
      reason: 'Vendor visit',
      status: 'Pending',
      dateCreated: '2026-09-16',
    },
    {
      id: 4,
      userId: 2,
      type: 'Departure',
      permissionDate: '2026-09-04',
      fromTime: '15:00',
      toTime: '17:00',
      duration: 2,
      status: 'Cancelled',
      dateCreated: '2026-09-03',
    },
  ];

  wfhRequests: MockWfhRequest[] = [
    {
      id: 1,
      userId: 5,
      date: '2026-09-25',
      note: 'Home internet day',
      status: 'Pending',
      dateCreated: '2026-09-14',
    },
    {
      id: 2,
      userId: 3,
      date: '2026-09-12',
      status: 'Approved',
      dateCreated: '2026-09-08',
    },
    {
      id: 3,
      userId: 4,
      date: '2026-09-19',
      note: 'School run',
      status: 'Pending',
      dateCreated: '2026-09-13',
    },
    {
      id: 4,
      userId: 6,
      date: '2026-09-11',
      status: 'Rejected',
      dateCreated: '2026-09-10',
      comment: 'On-site workshop',
    },
  ];

  getSubject(id: number): MockSubject | undefined {
    return this.subjects.find((row) => row.id === id);
  }

  getSprint(id: number): MockSprint | undefined {
    return this.sprints.find((row) => row.id === id);
  }

  subjectProgress(subjectId: number): number {
    return this.progress(this.tasks.filter((task) => task.subjectId === subjectId));
  }

  sprintProgress(sprintId: number): number {
    return this.progress(this.tasks.filter((task) => task.sprintIds.includes(sprintId)));
  }

  listSprints(archived: boolean): Array<MockSprint & { loNumber: number; progressPercent: number; learningObjects: MockIdName[] }> {
    return this.sprints
      .filter((sprint) => sprint.isArchived === archived)
      .map((sprint) => ({
        ...sprint,
        loNumber: sprint.learningObjectIds.length,
        progressPercent: this.sprintProgress(sprint.id),
        learningObjects: this.learningObjectives
          .filter((lo) => sprint.learningObjectIds.includes(lo.id))
          .map((lo) => ({ id: lo.id, name: lo.name })),
      }));
  }

  createSprint(input: CreateSprintInput): MockSprint {
    const sprint: MockSprint = {
      id: this.nextSprintId++,
      name: input.name,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      isArchived: false,
      learningObjectIds: [...input.learningObjectIds],
    };
    this.sprints = [...this.sprints, sprint];
    this.syncSprintTasks(sprint.id, sprint.learningObjectIds);
    return { ...sprint };
  }

  updateSprint(id: number, input: CreateSprintInput): MockSprint | undefined {
    const sprint = this.sprints.find((row) => row.id === id);
    if (!sprint) {
      return undefined;
    }
    sprint.name = input.name;
    sprint.description = input.description;
    sprint.startDate = input.startDate;
    sprint.endDate = input.endDate;
    sprint.learningObjectIds = [...input.learningObjectIds];
    this.syncSprintTasks(id, sprint.learningObjectIds);
    return { ...sprint };
  }

  archiveSprint(id: number, archived: boolean): MockSprint | undefined {
    const sprint = this.sprints.find((row) => row.id === id);
    if (!sprint) {
      return undefined;
    }
    sprint.isArchived = archived;
    return { ...sprint };
  }

  cardsFor(source: 'project' | 'sprint', id: number): MockTask[] {
    const rows =
      source === 'project'
        ? this.tasks.filter((task) => task.subjectId === id)
        : this.tasks.filter((task) => task.sprintIds.includes(id));
    return rows.map((task) => this.cloneTask(task));
  }

  sheetFor(projectId: number): MockProjectSheet | undefined {
    const subject = this.getSubject(projectId);
    if (!subject) {
      return undefined;
    }
    const los = this.learningObjectives.filter((lo) => lo.subjectId === projectId);
    const units = new Map<number, MockSheetUnit>();
    for (const lo of los) {
      let unit = units.get(lo.unitId);
      if (!unit) {
        unit = { id: lo.unitId, name: lo.unitName, lessons: [] };
        units.set(lo.unitId, unit);
      }
      let lesson = unit.lessons.find((item) => item.id === lo.lessonId);
      if (!lesson) {
        lesson = { id: lo.lessonId, name: lo.lessonName, learningObjectives: [] };
        unit.lessons.push(lesson);
      }
      lesson.learningObjectives.push({
        id: lo.id,
        name: lo.name,
        tag: lo.tag,
        template: lo.template,
        environment: lo.environment,
        schemaName: lo.schemaName,
        tasks: this.tasks
          .filter((task) => task.subjectId === projectId && task.learningObjective.id === lo.id)
          .map((task) => ({
            id: task.id,
            name: task.name,
            status: task.status,
            user: task.user ? { ...task.user } : undefined,
            flagged: task.flagged,
            paused: task.paused,
            isRollback: task.isRollback,
          })),
      });
    }
    return {
      id: subject.id,
      name: subject.name,
      units: [...units.values()],
      users: this.users.map((user) => ({ id: user.id, name: user.name })),
    };
  }

  sprintSheetFor(sprintId: number): MockProjectSheet | undefined {
    const sprint = this.getSprint(sprintId);
    if (!sprint) {
      return undefined;
    }
    const los = this.learningObjectives.filter((lo) => sprint.learningObjectIds.includes(lo.id));
    return {
      id: sprint.id,
      name: sprint.name,
      units: [
        {
          id: 0,
          name: 'Sprint learning objectives',
          lessons: [
            {
              id: 0,
              name: sprint.name,
              learningObjectives: los.map((lo) => ({
                id: lo.id,
                name: lo.name,
                tag: lo.tag,
                template: lo.template,
                environment: lo.environment,
                schemaName: lo.schemaName,
                tasks: this.tasks
                  .filter((task) => task.sprintIds.includes(sprintId) && task.learningObjective.id === lo.id)
                  .map((task) => ({
                    id: task.id,
                    name: task.name,
                    status: task.status,
                    user: task.user ? { ...task.user } : undefined,
                    flagged: task.flagged,
                    paused: task.paused,
                    isRollback: task.isRollback,
                  })),
              })),
            },
          ],
        },
      ],
      users: this.users.map((user) => ({ id: user.id, name: user.name })),
    };
  }

  getTask(id: number): MockTask | undefined {
    const task = this.tasks.find((row) => row.id === id);
    return task ? this.cloneTask(task) : undefined;
  }

  proceed(id: number): MockTask | undefined {
    const task = this.tasks.find((row) => row.id === id);
    if (!task) {
      return undefined;
    }
    if (task.status === 0) {
      task.status = 1;
    } else if (task.status === 1) {
      task.status = 2;
      task.startedAt = new Date().toISOString();
    }
    return this.cloneTask(task);
  }

  complete(id: number): MockTask | undefined {
    const task = this.tasks.find((row) => row.id === id);
    if (!task || task.status !== 2) {
      return task ? this.cloneTask(task) : undefined;
    }
    task.status = 3;
    task.doneAt = new Date().toISOString();
    return this.cloneTask(task);
  }

  assign(id: number, userId: number): MockTask | undefined {
    const task = this.tasks.find((row) => row.id === id);
    const user = this.users.find((row) => row.id === userId);
    if (!task || !user) {
      return undefined;
    }
    task.user = { id: user.id, name: user.name };
    if (task.status === 0 || task.status === 2) {
      task.status = 1;
    }
    return this.cloneTask(task);
  }

  flag(id: number): MockTask | undefined {
    const task = this.tasks.find((row) => row.id === id);
    if (!task) {
      return undefined;
    }
    task.flagged = !task.flagged;
    if (task.flagged && task.status !== 3 && task.status !== 4) {
      task.status = 1;
    }
    return this.cloneTask(task);
  }

  togglePause(id: number): MockTask | undefined {
    const task = this.tasks.find((row) => row.id === id);
    if (!task) {
      return undefined;
    }
    if (task.paused && task.status === 1) {
      task.paused = false;
      task.status = 2;
    } else if (!task.paused && task.status === 2) {
      task.paused = true;
      task.status = 1;
    }
    return this.cloneTask(task);
  }

  rollback(id: number): MockTask | undefined {
    const task = this.tasks.find((row) => row.id === id);
    if (!task) {
      return undefined;
    }
    task.isRollback = true;
    task.rollbackCount += 1;
    if (task.status > 0) {
      task.status = (task.status - 1) as MockTask['status'];
    }
    return this.cloneTask(task);
  }

  createTask(input: CreateTaskInput): MockTask {
    const lo = this.learningObjectives.find((row) => row.id === input.learningObjectiveId);
    const user = input.userId ? this.users.find((row) => row.id === input.userId) : undefined;
    const task: MockTask = {
      id: this.nextTaskId++,
      name: input.name,
      status: 0,
      priority: 0,
      subjectId: input.subjectId,
      sprintIds: this.sprints
        .filter((sprint) => !sprint.isArchived && lo && sprint.learningObjectIds.includes(lo.id))
        .map((sprint) => sprint.id),
      user: user ? { id: user.id, name: user.name } : undefined,
      learningObjective: lo ? { id: lo.id, name: lo.name } : { id: 0, name: 'Unknown' },
      flagged: false,
      attention: false,
      paused: false,
      isRollback: false,
      rollbackCount: 0,
      createdAt: new Date().toISOString(),
      startedAt: null,
      doneAt: null,
    };
    this.tasks = [...this.tasks, task];
    return this.cloneTask(task);
  }

  losForSubject(subjectId: number): MockLo[] {
    return this.learningObjectives.filter((lo) => lo.subjectId === subjectId).map((lo) => ({ ...lo }));
  }

  getUser(id: number): MockUser | undefined {
    const user = this.users.find((row) => row.id === id);
    return user ? { ...user, balances: { ...user.balances } } : undefined;
  }

  memberBalances(): MockUser[] {
    return this.users.map((user) => ({ ...user, balances: { ...user.balances } }));
  }

  listLeaves(filters: LeaveListFilters = {}): Array<MockLeaveRequest & { user: MockIdName & { code: string } }> {
    return this.leaveRequests
      .filter((row) => this.matchesLeaveFilters(row, filters, row.startDate, row.endDate, row.type))
      .map((row) => this.withUser(row));
  }

  listPermissions(filters: LeaveListFilters = {}): Array<MockPermissionRequest & { user: MockIdName & { code: string } }> {
    return this.permissionRequests
      .filter((row) => this.matchesLeaveFilters(row, filters, row.permissionDate, row.permissionDate, row.type))
      .map((row) => this.withUser(row));
  }

  listWfh(filters: LeaveListFilters = {}): Array<MockWfhRequest & { user: MockIdName & { code: string } }> {
    return this.wfhRequests
      .filter((row) => this.matchesLeaveFilters(row, filters, row.date, row.date))
      .map((row) => this.withUser(row));
  }

  getLeave(id: number): (MockLeaveRequest & { user: MockIdName & { code: string } }) | undefined {
    const row = this.leaveRequests.find((item) => item.id === id);
    return row ? this.withUser(row) : undefined;
  }

  getPermission(id: number): (MockPermissionRequest & { user: MockIdName & { code: string } }) | undefined {
    const row = this.permissionRequests.find((item) => item.id === id);
    return row ? this.withUser(row) : undefined;
  }

  getWfh(id: number): (MockWfhRequest & { user: MockIdName & { code: string } }) | undefined {
    const row = this.wfhRequests.find((item) => item.id === id);
    return row ? this.withUser(row) : undefined;
  }

  createLeave(input: CreateLeaveInput): MockLeaveRequest {
    const duration = countWorkingDays(input.startDate, input.endDate, MOCK_PUBLIC_HOLIDAYS);
    const row: MockLeaveRequest = {
      id: this.nextLeaveId++,
      userId: input.userId,
      type: input.type,
      startDate: input.startDate,
      endDate: input.endDate,
      duration,
      reason: input.reason,
      status: 'Pending',
      dateCreated: this.today(),
    };
    this.leaveRequests = [...this.leaveRequests, row];
    return { ...row };
  }

  createPermission(input: CreatePermissionInput): MockPermissionRequest {
    const duration = this.hoursBetween(input.fromTime, input.toTime);
    const row: MockPermissionRequest = {
      id: this.nextPermissionId++,
      userId: input.userId,
      type: input.type,
      permissionDate: input.permissionDate,
      fromTime: input.fromTime,
      toTime: input.toTime,
      duration,
      reason: input.reason,
      status: 'Pending',
      dateCreated: this.today(),
    };
    this.permissionRequests = [...this.permissionRequests, row];
    return { ...row };
  }

  createWfh(input: CreateWfhInput): MockWfhRequest {
    const row: MockWfhRequest = {
      id: this.nextWfhId++,
      userId: input.userId,
      date: input.date,
      note: input.note,
      status: 'Pending',
      dateCreated: this.today(),
    };
    this.wfhRequests = [...this.wfhRequests, row];
    return { ...row };
  }

  cancelLeave(id: number): MockLeaveRequest {
    return this.cancelRow(this.leaveRequests, id, (row) => row.startDate);
  }

  cancelPermission(id: number): MockPermissionRequest {
    return this.cancelRow(this.permissionRequests, id, (row) => row.permissionDate);
  }

  cancelWfh(id: number): MockWfhRequest {
    return this.cancelRow(this.wfhRequests, id, (row) => row.date);
  }

  decideLeave(id: number, approved: boolean, comment?: string): MockLeaveRequest {
    const row = this.leaveRequests.find((item) => item.id === id);
    if (!row) {
      throw new Error('Leave request not found');
    }
    this.applyDecision(row, approved, comment);
    if (approved) {
      this.bumpLeaveBalance(row.userId, row.type, row.duration);
    }
    return { ...row };
  }

  decidePermission(id: number, approved: boolean, comment?: string): MockPermissionRequest {
    const row = this.permissionRequests.find((item) => item.id === id);
    if (!row) {
      throw new Error('Permission request not found');
    }
    this.applyDecision(row, approved, comment);
    if (approved) {
      const user = this.users.find((item) => item.id === row.userId);
      if (user) {
        user.balances.permissionUsed += row.duration;
      }
    }
    return { ...row };
  }

  decideWfh(id: number, approved: boolean, comment?: string): MockWfhRequest {
    const row = this.wfhRequests.find((item) => item.id === id);
    if (!row) {
      throw new Error('WFH request not found');
    }
    this.applyDecision(row, approved, comment);
    if (approved) {
      const user = this.users.find((item) => item.id === row.userId);
      if (user) {
        user.balances.wfhUsed += 1;
      }
    }
    return { ...row };
  }

  private withUser<T extends { userId: number }>(row: T): T & { user: MockIdName & { code: string } } {
    const user = this.users.find((item) => item.id === row.userId);
    return {
      ...row,
      user: user ? { id: user.id, name: user.name, code: user.code } : { id: 0, name: 'Unknown', code: '' },
    };
  }

  private matchesLeaveFilters(
    row: { status: LeaveStatus; userId: number },
    filters: LeaveListFilters,
    start: string,
    end: string,
    type?: string,
  ): boolean {
    if (filters.userId && row.userId !== filters.userId) {
      return false;
    }
    if (filters.status && row.status !== filters.status) {
      return false;
    }
    if (filters.type && type && type !== filters.type) {
      return false;
    }
    if (filters.dateFrom && end < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && start > filters.dateTo) {
      return false;
    }
    return true;
  }

  private hoursBetween(fromTime: string, toTime: string): number {
    const [fromH, fromM] = fromTime.split(':').map(Number);
    const [toH, toM] = toTime.split(':').map(Number);
    const hours = toH + toM / 60 - (fromH + fromM / 60);
    return Math.max(0.5, Math.round(hours * 10) / 10);
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private cancelRow<T extends { id: number; status: LeaveStatus }>(
    rows: T[],
    id: number,
    startOf: (row: T) => string,
  ): T {
    const row = rows.find((item) => item.id === id);
    if (!row) {
      throw new Error('Request not found');
    }
    if (row.status === 'Cancelled' || row.status === 'Rejected') {
      throw new Error('This request cannot be cancelled');
    }
    if (row.status === 'Approved' && startOf(row) < this.today()) {
      throw new Error('Approved requests that already started cannot be cancelled');
    }
    row.status = 'Cancelled';
    return { ...row };
  }

  private applyDecision(row: { status: LeaveStatus; comment?: string }, approved: boolean, comment?: string): void {
    if (row.status !== 'Pending') {
      throw new Error('Only pending requests can be decided');
    }
    row.status = approved ? 'Approved' : 'Rejected';
    row.comment = comment;
  }

  private bumpLeaveBalance(userId: number, type: LeaveType, duration: number): void {
    const user = this.users.find((item) => item.id === userId);
    if (!user) {
      return;
    }
    if (type === 'Annual') {
      user.balances.annualUsed += duration;
    } else if (type === 'Sick') {
      user.balances.sickUsed += duration;
    } else if (type === 'Emergency') {
      user.balances.emergencyUsed += duration;
    }
  }

  listAdminUsers() {
    return this.users.filter((user) => !user.archived).map((user) => ({ ...user }));
  }

  getAdminUser(id: number) {
    const user = this.users.find((row) => row.id === id && !row.archived);
    return user ? { ...user } : undefined;
  }

  saveAdminUser(payload: {
    id?: number;
    name: string;
    hrCode: string;
    email?: string;
    phone?: string;
    title?: string;
    roleId: number;
    accountType: number;
    teamId?: number | null;
  }) {
    const role = this.roles.find((row) => row.id === payload.roleId);
    const team = payload.teamId ? this.teams.find((row) => row.id === payload.teamId) : undefined;
    if (payload.id != null) {
      const user = this.users.find((row) => row.id === payload.id);
      if (!user) {
        return undefined;
      }
      Object.assign(user, {
        name: payload.name,
        code: payload.hrCode,
        email: payload.email,
        phone: payload.phone,
        title: payload.title,
        roleId: payload.roleId,
        roleName: role?.name ?? user.roleName,
        accountType: payload.accountType,
        teamId: payload.teamId ?? null,
        teamName: team?.name ?? null,
      });
      return { ...user };
    }
    const id = Math.max(0, ...this.users.map((row) => row.id)) + 1;
    const created: MockUser = {
      id,
      name: payload.name,
      code: payload.hrCode,
      email: payload.email,
      phone: payload.phone,
      title: payload.title,
      roleId: payload.roleId,
      roleName: role?.name ?? 'Member',
      accountType: payload.accountType,
      teamId: payload.teamId ?? null,
      teamName: team?.name ?? null,
      balances: { ...DEFAULT_BALANCES() },
    };
    this.users.push(created);
    return { ...created };
  }

  archiveAdminUser(id: number) {
    const user = this.users.find((row) => row.id === id);
    if (!user) {
      return undefined;
    }
    user.archived = true;
    return { ...user };
  }

  listRoles() {
    return this.roles.map((role) => ({
      ...role,
      permissionCodes: this.permissions.filter((row) => role.permissionIds.includes(row.id)).map((row) => row.code),
    }));
  }

  saveRole(payload: { id?: number; name: string; description?: string; permissionIds: number[] }) {
    if (payload.id != null) {
      const role = this.roles.find((row) => row.id === payload.id);
      if (!role) {
        return undefined;
      }
      if (role.isSystem) {
        throw new Error('System roles cannot be edited');
      }
      role.name = payload.name;
      role.description = payload.description;
      role.permissionIds = [...payload.permissionIds];
      return this.listRoles().find((row) => row.id === role.id);
    }
    const id = Math.max(10, ...this.roles.map((row) => row.id)) + 1;
    this.roles.push({
      id,
      name: payload.name,
      description: payload.description,
      isSystem: false,
      permissionIds: [...payload.permissionIds],
    });
    return this.listRoles().find((row) => row.id === id);
  }

  deleteRole(id: number) {
    const role = this.roles.find((row) => row.id === id);
    if (!role) {
      return undefined;
    }
    if (role.isSystem) {
      throw new Error('System roles cannot be deleted');
    }
    this.roles = this.roles.filter((row) => row.id !== id);
    return role;
  }

  listTeams() {
    return this.teams
      .filter((team) => !team.archived)
      .map((team) => ({
        id: team.id,
        name: team.name,
        members: this.users.filter((user) => !user.archived && user.teamId === team.id).length,
        teamleaderId: team.teamleaderId ?? null,
        teamleaderName: this.users.find((user) => user.id === team.teamleaderId)?.name ?? null,
      }));
  }

  getTeam(id: number) {
    const team = this.teams.find((row) => row.id === id && !row.archived);
    if (!team) {
      return undefined;
    }
    return {
      id: team.id,
      name: team.name,
      members: this.users
        .filter((user) => !user.archived && user.teamId === team.id)
        .map((user) => ({ id: user.id, name: user.name })),
      teamleaderId: team.teamleaderId ?? null,
      teamleaderName: this.users.find((user) => user.id === team.teamleaderId)?.name ?? null,
    };
  }

  saveTeam(payload: { id?: number; name: string; memberIds?: number[]; teamleaderId?: number | null }) {
    let teamId: number;
    if (payload.id != null) {
      const team = this.teams.find((row) => row.id === payload.id);
      if (!team) {
        return undefined;
      }
      team.name = payload.name;
      if (payload.teamleaderId !== undefined) {
        team.teamleaderId = payload.teamleaderId;
      }
      teamId = team.id;
      for (const user of this.users) {
        if (user.teamId === team.id) {
          user.teamName = team.name;
        }
      }
    } else {
      teamId = Math.max(0, ...this.teams.map((row) => row.id)) + 1;
      this.teams.push({ id: teamId, name: payload.name, teamleaderId: payload.teamleaderId ?? null });
    }

    if (payload.memberIds) {
      const selected = new Set(payload.memberIds);
      for (const user of this.users) {
        if (selected.has(user.id)) {
          user.teamId = teamId;
          user.teamName = this.teams.find((row) => row.id === teamId)?.name ?? null;
        } else if (user.teamId === teamId) {
          user.teamId = null;
          user.teamName = null;
        }
      }
    }

    return this.getTeam(teamId);
  }

  archiveTeam(id: number) {
    const team = this.teams.find((row) => row.id === id);
    if (!team) {
      return undefined;
    }
    team.archived = true;
    return team;
  }

  listSections() {
    return this.sections
      .filter((section) => !section.archived)
      .map((section) => this.sectionDetail(section));
  }

  getSection(id: number) {
    const section = this.sections.find((row) => row.id === id && !row.archived);
    return section ? this.sectionDetail(section) : undefined;
  }

  saveSection(payload: { id?: number; name: string; headId: number; teamIds: number[] }) {
    if (payload.id != null) {
      const section = this.sections.find((row) => row.id === payload.id);
      if (!section) {
        return undefined;
      }
      section.name = payload.name;
      section.headId = payload.headId;
      section.teamIds = [...payload.teamIds];
      return this.sectionDetail(section);
    }
    const id = Math.max(0, ...this.sections.map((row) => row.id)) + 1;
    const created: MockSection = {
      id,
      name: payload.name,
      headId: payload.headId,
      teamIds: [...payload.teamIds],
    };
    this.sections.push(created);
    return this.sectionDetail(created);
  }

  archiveSection(id: number) {
    const section = this.sections.find((row) => row.id === id);
    if (!section) {
      return undefined;
    }
    section.archived = true;
    return section;
  }

  private sectionDetail(section: MockSection) {
    const head = this.users.find((user) => user.id === section.headId);
    return {
      id: section.id,
      name: section.name,
      head: { id: section.headId, name: head?.name ?? `User ${section.headId}` },
      teams: this.teams
        .filter((team) => section.teamIds.includes(team.id))
        .map((team) => ({ id: team.id, name: team.name })),
    };
  }

  private syncSprintTasks(sprintId: number, learningObjectIds: number[]): void {
    for (const task of this.tasks) {
      const belongs = learningObjectIds.includes(task.learningObjective.id);
      const hasSprint = task.sprintIds.includes(sprintId);
      if (belongs && !hasSprint) {
        task.sprintIds = [...task.sprintIds, sprintId];
      }
      if (!belongs && hasSprint) {
        task.sprintIds = task.sprintIds.filter((id) => id !== sprintId);
      }
    }
  }

  private progress(tasks: MockTask[]): number {
    if (!tasks.length) {
      return 0;
    }
    const done = tasks.filter((task) => task.status === 3 || task.status === 4).length;
    return Math.round((done / tasks.length) * 100);
  }

  private cloneTask(task: MockTask): MockTask {
    return {
      ...task,
      sprintIds: [...task.sprintIds],
      user: task.user ? { ...task.user } : undefined,
      learningObjective: { ...task.learningObjective },
    };
  }

  private card(
    id: number,
    name: string,
    status: TaskStatus,
    priority: TaskPriority,
    subjectId: number,
    sprintIds: number[],
    userId: number | undefined,
    loId: number,
    flagged: boolean,
    paused: boolean,
    startedAt: string | null = null,
    doneAt: string | null = null,
    isRollback = false,
    rollbackCount = 0,
  ): MockTask {
    const user = userId ? this.users.find((row) => row.id === userId) : undefined;
    const lo = this.learningObjectives.find((row) => row.id === loId);
    return {
      id,
      name,
      status,
      priority,
      subjectId,
      sprintIds,
      user: user ? { id: user.id, name: user.name } : undefined,
      learningObjective: lo ? { id: lo.id, name: lo.name } : { id: 0, name: 'Unknown' },
      flagged,
      attention: flagged,
      paused,
      isRollback,
      rollbackCount,
      createdAt: '2026-09-01T08:00:00Z',
      startedAt,
      doneAt,
    };
  }
}
