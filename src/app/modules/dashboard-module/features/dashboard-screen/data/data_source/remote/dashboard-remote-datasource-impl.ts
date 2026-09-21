import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UserRole } from '@core/models/user-role';
import { API } from '@core/network/api/api.const';
import { CurriculumCatalogService, YearTree, YearTreeProject } from '@core/network/curriculum-catalog.service';
import { mapHttpError } from '@core/network/http-error';
import { NetworkService } from '@core/network/network.service';
import { OrganizationCatalogService } from '@core/network/organization-catalog.service';
import { AggregatedTicketStats, TicketStatsService } from '@core/network/ticket-stats.service';
import { DirectoryUser, UserDirectoryService } from '@core/network/user-directory.service';
import { DashboardParams } from '../../../domain/entity/dashboard-params.entity';
import { DashboardModel } from '../../model/dashboard.model';
import { DashboardRemoteDataSource } from './dashboard-remote-datasource';

interface SubjectRef {
  id: number;
  name: string;
  projectId: number;
}

@Injectable()
export class DashboardRemoteDataSourceImpl extends DashboardRemoteDataSource {
  constructor(
    private catalog: CurriculumCatalogService,
    private users: UserDirectoryService,
    private network: NetworkService,
    private organization: OrganizationCatalogService,
    private ticketStats: TicketStatsService,
  ) {
    super();
  }

  getDashboard(params: DashboardParams): Observable<DashboardModel> {
    return forkJoin({
      trees: this.catalog.getTrees().pipe(catchError(() => of([] as YearTree[]))),
      users: this.users.list().pipe(catchError(() => of([] as DirectoryUser[]))),
      schemas: this.network.get<unknown[]>(API.Schemas.List).pipe(catchError(() => of([]))),
      teams: this.organization.listTeams().pipe(catchError(() => of([]))),
    }).pipe(
      switchMap(({ trees, users, schemas, teams }) => {
        const subjects = this.collectSubjects(trees);
        const subjectIds = subjects.map((subject) => subject.id);
        return this.ticketStats.aggregateForSubjects(subjectIds, params.userId).pipe(
          switchMap((stats) => {
            const role = params.role;
            if (role === UserRole.ProjectManager || role === UserRole.Owner) {
              return of(this.buildPmDashboard(trees, users, schemas, teams, stats));
            }
            if (role === UserRole.TeamLeader) {
              return of(this.buildTlDashboard(trees, users, params.userId, subjects, stats));
            }
            if (role === UserRole.SectionHead) {
              return this.buildSectionHeadDashboard(params.userId, users, teams, stats);
            }
            return of(this.buildMemberDashboard(stats));
          }),
        );
      }),
      catchError(mapHttpError),
    );
  }

  private buildPmDashboard(
    trees: YearTree[],
    users: DirectoryUser[],
    schemas: unknown[],
    teams: { id: number; name: string; members: number }[],
    stats: AggregatedTicketStats,
  ): DashboardModel {
    const projects = this.catalog.flattenProjects(trees);
    return {
      projectManager: {
        projectsReport: projects.map((project) => {
          const treeProject = this.findProject(trees, project.id);
          const projectSubjects = this.collectSubjectsForProject(treeProject);
          const loStats = projectSubjects.reduce(
            (acc, subject) => {
              const row = stats.bySubject.get(subject.id)?.loStats ?? { idle: 0, running: 0, done: 0, total: 0 };
              return {
                idle: acc.idle + row.idle,
                running: acc.running + row.running,
                done: acc.done + row.done,
                total: acc.total + row.total,
              };
            },
            { idle: 0, running: 0, done: 0, total: 0 },
          );
          return {
            id: project.id,
            name: project.name,
            description: project.description,
            term: treeProject?.terms?.[0]?.name ?? '',
            year: project.year,
            idleLearningObjectives: loStats.idle,
            runningLearningObjectives: loStats.running,
            doneLearningObjectives: loStats.done,
            totalLearningObjectives: loStats.total,
          };
        }),
        groupsCount: teams.map((team) => ({
          id: team.id,
          name: team.name,
          usersCount: team.members,
        })),
        numberOfProject: projects.length,
        numberOfUsers: users.length,
        numberOfSchemas: Array.isArray(schemas) ? schemas.length : 0,
        numberOfActiveTasks: stats.activeTaskCount,
      },
    };
  }

  private buildTlDashboard(
    trees: YearTree[],
    users: DirectoryUser[],
    userId: number,
    subjects: SubjectRef[],
    stats: AggregatedTicketStats,
  ): DashboardModel {
    const currentUser = users.find((user) => user.id === userId);
    const teamId = currentUser?.teamId ?? null;
    const teamMembers = teamId ? users.filter((user) => user.teamId === teamId) : [];
    const memberIds = new Set(teamMembers.map((user) => user.id));

    const teamTickets = stats.allTickets.filter((ticket) => ticket.userId && memberIds.has(ticket.userId));
    const activeTasks = teamTickets.filter((ticket) => ticket.status === 1 || ticket.status === 2).length;

    const projectsDetails = subjects
      .map((subject) => ({
        id: subject.id,
        name: subject.name,
        tasksCount: teamTickets.filter((ticket) => ticket.subjectId === subject.id).length,
      }))
      .filter((row) => row.tasksCount > 0)
      .slice(0, 8);

    const tasksPerUser = teamMembers
      .map((user) => ({
        id: user.id,
        name: user.name,
        tasksCount: teamTickets.filter((ticket) => ticket.userId === user.id).length,
      }))
      .filter((row) => row.tasksCount > 0)
      .slice(0, 8);

    const uniqueProjects = new Set(
      subjects.filter((subject) => teamTickets.some((ticket) => ticket.subjectId === subject.id)).map((subject) => subject.projectId),
    );

    return {
      teamLeader: {
        members: teamMembers.length,
        activeTasks,
        projects: uniqueProjects.size || this.catalog.flattenProjects(trees).length,
        projectsDetails,
        tasksPerUser,
      },
    };
  }

  private buildSectionHeadDashboard(
    userId: number,
    users: DirectoryUser[],
    teams: { id: number; name: string; members: number }[],
    stats: AggregatedTicketStats,
  ): Observable<DashboardModel> {
    return this.organization.listSections().pipe(
      switchMap((sections) => {
        if (!sections.length) {
          return of(this.emptySectionHead());
        }
        return forkJoin(
          sections.map((section) =>
            this.organization.getSection(section.id).pipe(catchError(() => of(null))),
          ),
        ).pipe(
          map((details) => {
            const section = details.find((row) => row?.head.id === userId);
            if (!section) {
              return this.emptySectionHead();
            }
            const teamIds = new Set(section.teams.map((team) => team.id));
            const sectionMembers = users.filter((user) => user.teamId && teamIds.has(user.teamId));
            const memberIds = new Set(sectionMembers.map((user) => user.id));
            const sectionTickets = stats.allTickets.filter((ticket) => ticket.userId && memberIds.has(ticket.userId));
            const activeTasks = sectionTickets.filter((ticket) => ticket.status === 1 || ticket.status === 2).length;

            const teamsDetails = section.teams.map((team) => {
              const teamMemberIds = new Set(
                sectionMembers.filter((user) => user.teamId === team.id).map((user) => user.id),
              );
              const tasksCount = sectionTickets.filter(
                (ticket) => ticket.userId && teamMemberIds.has(ticket.userId),
              ).length;
              const catalogTeam = teams.find((row) => row.id === team.id);
              return {
                id: team.id,
                name: team.name,
                membersCount: catalogTeam?.members ?? teamMemberIds.size,
                tasksCount,
              };
            });

            return {
              sectionHead: {
                teamsCount: section.teams.length,
                members: sectionMembers.length,
                activeTasks,
                teamsDetails,
              },
            };
          }),
        );
      }),
      catchError(() => of(this.emptySectionHead())),
    );
  }

  private buildMemberDashboard(stats: AggregatedTicketStats): DashboardModel {
    return {
      member: {
        assignedTasks: stats.memberCounts.assigned,
        inProgressTasks: stats.memberCounts.inProgress,
        doneTasks: stats.memberCounts.done,
        overdueTasks: stats.memberCounts.overdue,
      },
    };
  }

  private emptySectionHead(): DashboardModel {
    return {
      sectionHead: {
        teamsCount: 0,
        members: 0,
        activeTasks: 0,
        teamsDetails: [],
      },
    };
  }

  private collectSubjects(trees: YearTree[]): SubjectRef[] {
    const rows: SubjectRef[] = [];
    for (const year of trees) {
      for (const project of year.projects ?? []) {
        for (const term of project.terms ?? []) {
          for (const group of term.subjectGroups ?? []) {
            for (const subject of group.subjects ?? []) {
              rows.push({ id: subject.id, name: subject.name, projectId: project.id });
            }
          }
        }
      }
    }
    return rows;
  }

  private collectSubjectsForProject(project?: YearTreeProject): SubjectRef[] {
    if (!project) {
      return [];
    }
    const rows: SubjectRef[] = [];
    for (const term of project.terms ?? []) {
      for (const group of term.subjectGroups ?? []) {
        for (const subject of group.subjects ?? []) {
          rows.push({ id: subject.id, name: subject.name, projectId: project.id });
        }
      }
    }
    return rows;
  }

  private findProject(trees: YearTree[], projectId: number): YearTreeProject | undefined {
    for (const year of trees) {
      const project = year.projects?.find((row) => row.id === projectId);
      if (project) {
        return project;
      }
    }
    return undefined;
  }
}
