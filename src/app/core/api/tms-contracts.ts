/** Typed HTTP contracts mirrored from TaskManagementSystem.Api.Contracts.
 * Keep this file aligned with `tms-openapi.json` (run `npm run openapi:sync`).
 */

export interface AccessTokenResponse {
  accessToken: string;
}

export interface AuthInfoResponse {
  id: number;
  name: string;
  role: number;
  roleName: string;
  permissions: string[];
  group?: string | null;
  teamId?: number | null;
  headedTeamIds?: number[];
  notifications: number;
}

export interface UserListItemResponse {
  id: number;
  code: string;
  name: string;
  roleId: number;
  roleName: string;
  teamId?: number | null;
  teamName?: string | null;
}

export interface UserDetailResponse {
  id: number;
  code: string;
  name: string;
  hrCode: string;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  roleId: number;
  roleName: string;
  accountType: number;
  onBoard: boolean;
  teamId?: number | null;
  teamName?: string | null;
  teamleaderId?: number | null;
  teamleaderName?: string | null;
}

export interface TeamListItemResponse {
  id: number;
  name: string;
  members: number;
  teamleaderId?: number | null;
  teamleaderName?: string | null;
}

export interface TeamMemberResponse {
  id: number;
  name: string;
}

export interface TeamDetailResponse {
  id: number;
  name: string;
  members: TeamMemberResponse[];
  teamleaderId?: number | null;
  teamleaderName?: string | null;
}

export interface CreateTeamRequest {
  name: string;
  teamleaderId?: number | null;
}

export interface UpdateTeamRequest {
  name: string;
  teamleaderId?: number | null;
}

export interface TicketListItemResponse {
  id: number;
  name: string;
  status: number;
  priority: number;
  duration: number;
  createdAt: string;
  learningObjectiveId: number;
  stepId?: number | null;
  userId?: number | null;
  teamId?: number | null;
  pause?: boolean;
  attention?: boolean;
  flagged?: boolean;
  isRollback?: boolean;
  rollbackCount?: number;
}

export interface TicketListPageResponse {
  items: TicketListItemResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface TicketDetailResponse extends TicketListItemResponse {
  tl?: boolean;
  isReview?: boolean;
  fromId?: number | null;
}

export interface TicketStatsTicket {
  id: number;
  status: number;
  userId?: number | null;
  learningObjectiveId: number;
  subjectId: number;
}

export interface TicketStatsLearningObjective {
  id: number;
  subjectId: number;
}

export interface TicketStatsResponse {
  tickets: TicketStatsTicket[];
  learningObjectives: TicketStatsLearningObjective[];
}

export interface TicketSummaryResponse {
  backlog: number;
  toDo: number;
  doing: number;
  done: number;
  totalCount: number;
  calculatedAtUtc: string;
}

export interface AnalyticsOverviewResponse {
  scopeId: number;
  scopeType: string;
  totalLearningObjectives: number;
  idleLearningObjectives: number;
  runningLearningObjectives: number;
  doneLearningObjectives: number;
  progressPercent: number;
  backlogTickets: number;
  toDoTickets: number;
  doingTickets: number;
  doneTickets: number;
  calculatedAtUtc: string;
}

export interface LeavePreviewResponse {
  requestedDays: number;
  availableAnnual: number;
  neededFromNext: number;
  fromNextBalanceMaxDays: number;
  alreadyUsedFromNext: number;
  pendingFromNext: number;
  requiresConfirmation: boolean;
  errorMessage?: string | null;
}

export interface LeaveBalancesResponse {
  annualLeave: number;
  annualLeaveMax: number;
  availableAnnualLeave: number;
  emergencyLeave: number;
  emergencyLeaveMax: number;
  availableEmergencyLeave: number;
  sickLeave: number;
  fromNextBalanceDaysUsed: number;
  fromNextBalanceMaxDays: number;
  permission: number;
  permissionMax: number;
  availablePermission: number;
  workFromHome: number;
  workFromHomeMax: number;
  availableWorkFromHome: number;
}

export interface NotificationListItemResponse {
  id: number;
  title: string;
  message: string;
  category: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: number | null;
}

export interface NotificationListPageResponse {
  items: NotificationListItemResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface HolidayResponse {
  id: number;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  createdByUserId: number;
}

export interface ForgotClockRequestResponse {
  id: number;
  userId: number;
  punchType: string;
  status: string;
  attendanceDate: string;
  intendedTime: string;
  reason?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  opinions?: { comment?: string; isApproved?: boolean }[];
}

export interface BulkOpinionResponse {
  succeeded: number;
  failed: number;
  failedLeaveRequestIds?: number[];
  failedPermissionIds?: number[];
  failedWorkFromHomeRequestIds?: number[];
  failedForgotClockRequestIds?: number[];
}

export interface RealtimeMessage {
  eventName: string;
  kind: number;
  payload?: unknown;
}
