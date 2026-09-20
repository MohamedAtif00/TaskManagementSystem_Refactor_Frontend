export enum UserRole {
  ProjectManager = 0,
  SectionHead = 1,
  TeamLeader = 2,
  Member = 3,
  Owner = 4,
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ProjectManager]: 'Project Manager',
  [UserRole.SectionHead]: 'Section Head',
  [UserRole.TeamLeader]: 'Team Leader',
  [UserRole.Member]: 'Member',
  [UserRole.Owner]: 'Owner',
};

export const ADMIN_ROLES: UserRole[] = [UserRole.ProjectManager, UserRole.Owner];

export const LEAVE_APPROVER_ROLES: UserRole[] = [
  UserRole.ProjectManager,
  UserRole.SectionHead,
  UserRole.TeamLeader,
  UserRole.Owner,
];
