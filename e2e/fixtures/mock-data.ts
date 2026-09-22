export const years = [{ id: 1, name: '2026' }, { id: 2, name: '2025' }];

export const yearTree = {
  id: 1,
  name: '2026',
  description: '2026 curriculum year',
  projects: [
    {
      id: 1,
      name: 'Primary 2026',
      description: 'Primary stage year root',
      terms: [
        {
          id: 1,
          name: 'Term 1',
          startDate: null,
          endDate: null,
          subjectGroups: [
            {
              id: 1,
              name: 'Math',
              subjects: [
                { id: 11, name: 'Algebra', description: 'Algebra course', status: 0 },
                { id: 12, name: 'Geometry', description: 'Geometry course', status: 0 },
              ],
            },
            {
              id: 2,
              name: 'Science',
              subjects: [{ id: 13, name: 'Physics', description: 'Physics course', status: 0 }],
            },
          ],
        },
        {
          id: 2,
          name: 'Term 2',
          startDate: null,
          endDate: null,
          subjectGroups: [
            {
              id: 3,
              name: 'Math',
              subjects: [{ id: 14, name: 'Calculus', description: 'Calculus course', status: 0 }],
            },
          ],
        },
      ],
    },
  ],
};

export const users = [
  {
    id: 1,
    code: 'TST001',
    name: 'Omar Owner',
    roleId: 4,
    roleName: 'Owner',
    teamId: 1,
    teamName: 'Leadership',
    hrCode: 'TST001',
    accountType: 0,
  },
  {
    id: 2,
    code: 'PM001',
    name: 'Paula Manager',
    roleId: 0,
    roleName: 'Project Manager',
    teamId: 2,
    teamName: 'PMO',
    hrCode: 'PM001',
    accountType: 0,
  },
  {
    id: 3,
    code: 'TL001',
    name: 'Tarek Leader',
    roleId: 2,
    roleName: 'Team Leader',
    teamId: 3,
    teamName: 'Math Team',
    hrCode: 'TL001',
    accountType: 0,
  },
  {
    id: 5,
    code: 'MEM001',
    name: 'Mona Member',
    roleId: 3,
    roleName: 'Member',
    teamId: 3,
    teamName: 'Math Team',
    hrCode: 'MEM001',
    accountType: 0,
  },
  {
    id: 6,
    code: 'SH001',
    name: 'Sarah Section Head',
    roleId: 1,
    roleName: 'Section Head',
    teamId: 2,
    teamName: 'PMO',
    hrCode: 'SH001',
    accountType: 0,
  },
];

export const roles = [
  { id: 0, name: 'Project Manager', description: 'PMO', isSystem: true },
  { id: 1, name: 'Section Head', description: 'Section lead', isSystem: true },
  { id: 2, name: 'Team Leader', description: 'Team lead', isSystem: true },
  { id: 3, name: 'Member', description: 'Contributor', isSystem: true },
  { id: 4, name: 'Owner', description: 'Full access', isSystem: true },
];

export const permissions = [
  { id: 1, code: 'users.read', name: 'Read users' },
  { id: 2, code: 'users.write', name: 'Write users' },
  { id: 3, code: 'projects.read', name: 'Read projects' },
];

export const teams = [
  { id: 1, name: 'Leadership', members: 1 },
  { id: 2, name: 'PMO', members: 2 },
  { id: 3, name: 'Math Team', members: 2 },
];

export const teamDetails: Record<number, { id: number; name: string; members: { id: number; name: string }[] }> = {
  1: { id: 1, name: 'Leadership', members: [{ id: 1, name: 'Omar Owner' }] },
  2: { id: 2, name: 'PMO', members: [{ id: 2, name: 'Paula Manager' }, { id: 6, name: 'Sarah Section Head' }] },
  3: {
    id: 3,
    name: 'Math Team',
    members: [
      { id: 3, name: 'Tarek Leader' },
      { id: 5, name: 'Mona Member' },
    ],
  },
};

export const sections = [{ id: 1, name: 'STEM' }];

export const sectionDetail = {
  id: 1,
  name: 'STEM',
  head: { id: 6, name: 'Sarah Section Head' },
  teams: [
    { id: 3, name: 'Math Team' },
    { id: 2, name: 'PMO' },
  ],
};

export const sectionRows = [
  { id: 1, name: 'STEM', headName: 'Sarah Section Head', teamIds: [3, 2], teams: [{ id: 3, name: 'Math Team' }, { id: 2, name: 'PMO' }] },
];

export const roleRows = [
  { id: 0, name: 'Project Manager', description: 'PMO', isSystem: true, permissionCount: 3, permissionIds: [1, 2, 3] },
  { id: 3, name: 'Member', description: 'Contributor', isSystem: true, permissionCount: 1, permissionIds: [1] },
  { id: 4, name: 'Owner', description: 'Full access', isSystem: true, permissionCount: 3, permissionIds: [1, 2, 3] },
];

export const sprints = [
  {
    id: 1,
    name: 'Algebra Sprint',
    description: 'Linear and quadratic coverage for Term 1.',
    startDate: '2026-09-01',
    endDate: '2026-09-14',
    learningObjectiveIds: [101, 102, 103],
  },
  {
    id: 2,
    name: 'Physics Burst',
    description: 'Kinematics cards for the science section.',
    startDate: '2026-09-08',
    endDate: '2026-09-21',
    learningObjectiveIds: [201, 202],
  },
  {
    id: 3,
    name: 'Archived Sprint',
    description: 'Old sprint',
    startDate: '2025-01-01',
    endDate: '2025-01-14',
    learningObjectiveIds: [101],
  },
];

export const schemas = [
  { id: 1, name: 'Default', description: 'Starter schema', typeId: 1 },
  { id: 2, name: 'Review flow', description: 'Review schema', typeId: 1 },
];

export const schemaTypes = [{ id: 1, name: 'Standard', description: 'Standard workflow type' }];

export const taskBank = [
  { id: 1, name: 'Create ticket', duration: 60, type: 0, active: true, tl: false, teamId: 3, teamName: 'Math Team' },
  { id: 2, name: 'Review content', duration: 45, type: 1, active: true, tl: true, teamId: 3, teamName: 'Math Team' },
];

export const subjectTickets = [
  {
    id: 1,
    name: 'Draft linear worksheet',
    status: 0,
    priority: 2,
    createdAt: '2026-09-01T08:00:00Z',
    learningObjectiveId: 101,
    userId: 5,
    pause: false,
    attention: false,
    flagged: false,
    isRollback: false,
    rollbackCount: 0,
  },
  {
    id: 2,
    name: 'Review linear quiz',
    status: 1,
    priority: 3,
    createdAt: '2026-09-02T08:00:00Z',
    learningObjectiveId: 101,
    userId: 5,
    pause: false,
    attention: false,
    flagged: true,
    isRollback: false,
    rollbackCount: 0,
  },
  {
    id: 3,
    name: 'Record linear video',
    status: 2,
    priority: 3,
    createdAt: '2026-09-03T08:00:00Z',
    learningObjectiveId: 102,
    userId: 5,
    pause: false,
    attention: false,
    flagged: false,
    isRollback: false,
    rollbackCount: 0,
  },
  {
    id: 5,
    name: 'Completed worksheet',
    status: 3,
    priority: 2,
    createdAt: '2026-09-04T08:00:00Z',
    learningObjectiveId: 102,
    userId: 5,
    pause: false,
    attention: false,
    flagged: false,
    isRollback: false,
    rollbackCount: 0,
  },
];

export const sprintTickets = [
  {
    id: 4,
    name: 'Graphing activity',
    status: 1,
    priority: 2,
    createdAt: '2026-09-04T08:00:00Z',
    learningObjectiveId: 102,
    userId: 5,
    pause: false,
    attention: false,
    flagged: false,
    isRollback: false,
    rollbackCount: 0,
  },
];

export const subjectUsers = [
  { id: 5, name: 'Mona Member' },
  { id: 3, name: 'Tarek Leader' },
];

export const subjectUnits = [{ id: 1, name: 'Equations' }];

export const unitLessons = [{ id: 11, name: 'Linear', unitId: 1 }];

export const lessonLos = [
  {
    id: 101,
    name: 'Solve linear equations',
    tag: 'ALG-01',
    template: 'Interactive',
    environment: 'Web',
    lessonId: 11,
  },
  {
    id: 102,
    name: 'Graph linear functions',
    tag: 'ALG-02',
    template: 'Worksheet',
    environment: 'Web',
    lessonId: 11,
  },
  {
    id: 103,
    name: 'Apply slope formula',
    tag: 'ALG-03',
    template: 'Worksheet',
    environment: 'Web',
    lessonId: 11,
  },
];

export const learningObjective = { id: 101, name: 'Solve linear equations' };

export const leaveBalances = {
  annualLeave: 3,
  annualLeaveMax: 21,
  sickLeave: 1,
  emergencyLeave: 0,
  emergencyLeaveMax: 7,
  permission: 2,
  permissionMax: 12,
  workFromHome: 1,
  workFromHomeMax: 8,
};

export const leaveRequests = [
  {
    id: 1,
    userId: 5,
    type: 'Annual',
    status: 'Pending',
    startDate: '2026-09-20',
    endDate: '2026-09-22',
    workingDays: 3,
    reason: 'Family visit',
    dateCreated: '2026-09-12',
    opinions: [],
  },
  {
    id: 3,
    userId: 5,
    type: 'Emergency',
    status: 'Pending',
    startDate: '2026-09-25',
    endDate: '2026-09-25',
    workingDays: 1,
    reason: 'Personal emergency',
    dateCreated: '2026-09-14',
    opinions: [],
  },
  {
    id: 2,
    userId: 5,
    type: 'Sick',
    status: 'Approved',
    startDate: '2026-09-05',
    endDate: '2026-09-05',
    workingDays: 1,
    reason: 'Flu',
    dateCreated: '2026-09-04',
    opinions: [],
  },
];

export const permissionRequests = [
  {
    id: 1,
    userId: 5,
    type: 'EarlyDeparture',
    status: 'Pending',
    permissionDate: '2026-09-18',
    fromTime: '14:00',
    toTime: '16:00',
    reason: 'Appointment',
    createdAt: '2026-09-15',
    opinions: [],
  },
];

export const wfhRequests = [
  {
    id: 1,
    userId: 5,
    date: '2026-09-25',
    status: 'Pending',
    noteForManager: 'Home internet day',
    dateCreated: '2026-09-14',
    opinions: [],
  },
];

export const memberLeaveSummaries = [
  { id: 5, name: 'Mona Member', teamName: 'Math Team', pendingCount: 1 },
];

export const notifications = [
  {
    id: 1,
    title: 'Ticket assigned',
    message: 'You were assigned Algebra task',
    category: 'ticket',
    type: 'info',
    isRead: false,
    createdAt: '2026-09-21T10:00:00.000Z',
    relatedEntityId: 101,
  },
  {
    id: 2,
    title: 'Leave approved',
    message: 'Your leave request was approved',
    category: 'hr',
    type: 'info',
    isRead: false,
    createdAt: '2026-09-21T11:00:00.000Z',
    relatedEntityId: null,
  },
  {
    id: 3,
    title: 'Sprint started',
    message: 'Sprint 1 has started',
    category: 'sprint',
    type: 'info',
    isRead: true,
    createdAt: '2026-09-20T09:00:00.000Z',
    relatedEntityId: 1,
  },
];

