import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { UserRole } from '@core/models/user-role';
import { DashboardParams } from '../../../domain/entity/dashboard-params.entity';
import { DashboardModel } from '../../model/dashboard.model';
import { DashboardLocalDataSource } from './dashboard-local-datasource';

@Injectable()
export class DashboardLocalDataSourceImpl extends DashboardLocalDataSource {
  getDashboard(params: DashboardParams): Observable<DashboardModel> {
    const role = params.role;
    if (role === UserRole.ProjectManager || role === UserRole.Owner) {
      return of(this.pmDashboard()).pipe(delay(150));
    }
    if (role === UserRole.TeamLeader) {
      return of(this.tlDashboard()).pipe(delay(150));
    }
    if (role === UserRole.SectionHead) {
      return of(this.sectionHeadDashboard()).pipe(delay(150));
    }
    return of(this.memberDashboard()).pipe(delay(150));
  }

  private pmDashboard(): DashboardModel {
    return {
      projectManager: {
        numberOfUsers: 48,
        numberOfProject: 6,
        numberOfSchemas: 12,
        numberOfActiveTasks: 34,
        groupsCount: [
          { id: 1, name: 'Math Team', usersCount: 12 },
          { id: 2, name: 'Science Team', usersCount: 9 },
          { id: 3, name: 'Arabic Team', usersCount: 8 },
          { id: 4, name: 'PMO', usersCount: 5 },
        ],
        projectsReport: [
          {
            id: 1,
            name: 'Primary 2026',
            description: 'Year root',
            term: 'Term 1',
            year: '2026',
            idleLearningObjectives: 18,
            runningLearningObjectives: 24,
            doneLearningObjectives: 41,
            totalLearningObjectives: 83,
          },
          {
            id: 2,
            name: 'Prep 2026',
            description: 'Year root',
            term: 'Term 1',
            year: '2026',
            idleLearningObjectives: 11,
            runningLearningObjectives: 19,
            doneLearningObjectives: 27,
            totalLearningObjectives: 57,
          },
        ],
      },
    };
  }

  private tlDashboard(): DashboardModel {
    return {
      teamLeader: {
        members: 8,
        activeTasks: 14,
        projects: 3,
        projectsDetails: [
          { id: 1, name: 'Algebra Term 1', tasksCount: 6 },
          { id: 2, name: 'Geometry Term 1', tasksCount: 5 },
          { id: 3, name: 'Statistics Term 1', tasksCount: 3 },
        ],
        tasksPerUser: [
          { id: 5, name: 'Mona Member', tasksCount: 4 },
          { id: 6, name: 'Karim Member', tasksCount: 3 },
          { id: 7, name: 'Nour Member', tasksCount: 2 },
        ],
      },
    };
  }

  private sectionHeadDashboard(): DashboardModel {
    return {
      sectionHead: {
        teamsCount: 3,
        members: 18,
        activeTasks: 22,
        teamsDetails: [
          { id: 1, name: 'Math Team', membersCount: 8, tasksCount: 10 },
          { id: 2, name: 'Science Team', membersCount: 6, tasksCount: 7 },
          { id: 3, name: 'Arabic Team', membersCount: 4, tasksCount: 5 },
        ],
      },
    };
  }

  private memberDashboard(): DashboardModel {
    return {
      member: {
        assignedTasks: 5,
        inProgressTasks: 2,
        doneTasks: 1,
        overdueTasks: 0,
      },
    };
  }
}
