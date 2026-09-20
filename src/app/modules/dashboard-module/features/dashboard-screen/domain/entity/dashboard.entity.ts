export interface ProjectReport {
  id: number;
  name: string;
  description: string;
  term: string;
  year: string;
  idleLearningObjectives: number;
  runningLearningObjectives: number;
  doneLearningObjectives: number;
  totalLearningObjectives: number;
}

export interface GroupCount {
  id: number;
  name: string;
  usersCount: number;
}

export interface ProjectManagerDashboard {
  projectsReport: ProjectReport[];
  groupsCount: GroupCount[];
  numberOfProject: number;
  numberOfUsers: number;
  numberOfSchemas: number;
  numberOfActiveTasks: number;
}

export interface TeamLeaderDashboard {
  members: number;
  activeTasks: number;
  projects: number;
  projectsDetails: { id: number; name: string; tasksCount: number }[];
  tasksPerUser: { id: number; name: string; tasksCount: number }[];
}

export interface MemberDashboard {
  assignedTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  overdueTasks: number;
}

export interface DashboardEntity {
  projectManager?: ProjectManagerDashboard;
  teamLeader?: TeamLeaderDashboard;
  member?: MemberDashboard;
}
