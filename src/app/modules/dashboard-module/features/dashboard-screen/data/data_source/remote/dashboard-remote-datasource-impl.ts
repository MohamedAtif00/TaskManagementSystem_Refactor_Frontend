import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserRole } from '@core/models/user-role';
import { API } from '@core/network/api/api.const';
import { CurriculumCatalogService } from '@core/network/curriculum-catalog.service';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { UserDirectoryService } from '@core/network/user-directory.service';
import { DashboardModel } from '../../model/dashboard.model';
import { DashboardRemoteDataSource } from './dashboard-remote-datasource';

@Injectable()
export class DashboardRemoteDataSourceImpl extends DashboardRemoteDataSource {
  constructor(
    private catalog: CurriculumCatalogService,
    private users: UserDirectoryService,
    private network: NetworkService,
  ) {
    super();
  }

  getDashboard(role: UserRole): Observable<DashboardModel> {
    return forkJoin({
      trees: this.catalog.getTrees().pipe(catchError(() => of([]))),
      users: this.users.list().pipe(catchError(() => of([]))),
      sprints: this.network.get<unknown[]>(API.Sprints.List).pipe(catchError(() => of([]))),
      schemas: this.network.get<unknown[]>(API.Schemas.List).pipe(catchError(() => of([]))),
    }).pipe(
      map(({ trees, users, sprints: _sprints, schemas }) => {
        const projects = this.catalog.flattenProjects(trees);
        const subjects = this.catalog.flattenSubjects(trees);
        if (role === UserRole.ProjectManager || role === UserRole.Owner) {
          return {
            projectManager: {
              projectsReport: projects.map((project) => ({
                id: project.id,
                name: project.name,
                description: project.description,
                term: '',
                year: project.year,
                idleLearningObjectives: 0,
                runningLearningObjectives: 0,
                doneLearningObjectives: 0,
                totalLearningObjectives: 0,
              })),
              groupsCount: [],
              numberOfProject: projects.length,
              numberOfUsers: users.length,
              numberOfSchemas: Array.isArray(schemas) ? schemas.length : 0,
              numberOfActiveTasks: 0,
            },
          };
        }
        if (role === UserRole.TeamLeader) {
          return {
            teamLeader: {
              members: users.length,
              activeTasks: 0,
              projects: projects.length,
              projectsDetails: subjects.slice(0, 8).map((subject) => ({
                id: subject.id,
                name: subject.name,
                tasksCount: 0,
              })),
              tasksPerUser: users.slice(0, 8).map((user) => ({
                id: user.id,
                name: user.name,
                tasksCount: 0,
              })),
            },
          };
        }
        return {
          member: {
            assignedTasks: 0,
            inProgressTasks: 0,
            doneTasks: 0,
            overdueTasks: 0,
          },
        };
      }),
      catchError(mapHttpError),
    );
  }
}
