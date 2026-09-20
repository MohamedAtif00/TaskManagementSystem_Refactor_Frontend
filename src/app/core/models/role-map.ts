import { UserRole } from './user-role';

const ROLE_NAMES: Record<string, UserRole> = {
  Owner: UserRole.Owner,
  ProjectManger: UserRole.ProjectManager,
  ProjectManager: UserRole.ProjectManager,
  SectionHead: UserRole.SectionHead,
  TeamLeader: UserRole.TeamLeader,
  Member: UserRole.Member,
};

export function mapApiRole(role: number, roleName?: string): UserRole {
  if (role >= UserRole.ProjectManager && role <= UserRole.Owner) {
    return role as UserRole;
  }
  return ROLE_NAMES[roleName ?? ''] ?? UserRole.Member;
}

export const SUBJECT_STATUS_LABELS: Record<number, string> = {
  0: 'Active',
  1: 'Closed',
  2: 'Hold',
  3: 'Reopened',
};

/** API: None=0 High=1 Medium=2 Low=3 → UI: None=0 Low=1 Medium=2 High=3 */
export function mapApiPriority(api: number): 0 | 1 | 2 | 3 {
  if (api === 1) {
    return 3;
  }
  if (api === 3) {
    return 1;
  }
  return (api === 2 ? 2 : 0) as 0 | 1 | 2 | 3;
}
