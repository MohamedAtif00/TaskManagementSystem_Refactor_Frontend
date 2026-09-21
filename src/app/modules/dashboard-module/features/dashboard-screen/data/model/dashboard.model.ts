import {
  DashboardEntity,
  MemberDashboard,
  ProjectManagerDashboard,
  SectionHeadDashboard,
  TeamLeaderDashboard,
} from '../../domain/entity/dashboard.entity';

export interface DashboardModel {
  projectManager?: ProjectManagerDashboard;
  teamLeader?: TeamLeaderDashboard;
  sectionHead?: SectionHeadDashboard;
  member?: MemberDashboard;
}

export class DashboardMapper {
  static toEntity(model: DashboardModel): DashboardEntity {
    return { ...model };
  }
}
