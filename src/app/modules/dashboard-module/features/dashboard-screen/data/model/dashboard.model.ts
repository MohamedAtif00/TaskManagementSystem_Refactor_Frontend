import {
  DashboardEntity,
  MemberDashboard,
  ProjectManagerDashboard,
  TeamLeaderDashboard,
} from '../../domain/entity/dashboard.entity';

export interface DashboardModel {
  projectManager?: ProjectManagerDashboard;
  teamLeader?: TeamLeaderDashboard;
  member?: MemberDashboard;
}

export class DashboardMapper {
  static toEntity(model: DashboardModel): DashboardEntity {
    return { ...model };
  }
}
