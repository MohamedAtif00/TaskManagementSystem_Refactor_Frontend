export interface MockUserAccount {
  id: number;
  code: string;
  name: string;
  role: number;
  roleName: string;
  group: string;
  token: string;
}

export const DEMO_USERS: Record<string, MockUserAccount> = {
  TST001: {
    id: 1,
    code: 'TST001',
    name: 'Omar Owner',
    role: 4,
    roleName: 'Owner',
    group: 'Leadership',
    token: 'eyJ.test.tst001',
  },
  OWN001: {
    id: 1,
    code: 'OWN001',
    name: 'Omar Owner',
    role: 4,
    roleName: 'Owner',
    group: 'Leadership',
    token: 'eyJ.test.own001',
  },
  PM001: {
    id: 2,
    code: 'PM001',
    name: 'Paula Manager',
    role: 0,
    roleName: 'Project Manager',
    group: 'PMO',
    token: 'eyJ.test.pm001',
  },
  SH001: {
    id: 6,
    code: 'SH001',
    name: 'Sarah Section Head',
    role: 1,
    roleName: 'Section Head',
    group: 'STEM',
    token: 'eyJ.test.sh001',
  },
  TL001: {
    id: 3,
    code: 'TL001',
    name: 'Tarek Leader',
    role: 2,
    roleName: 'Team Leader',
    group: 'Math Team',
    token: 'eyJ.test.tl001',
  },
  MEM001: {
    id: 5,
    code: 'MEM001',
    name: 'Mona Member',
    role: 3,
    roleName: 'Member',
    group: 'Math Team',
    token: 'eyJ.test.mem001',
  },
};
