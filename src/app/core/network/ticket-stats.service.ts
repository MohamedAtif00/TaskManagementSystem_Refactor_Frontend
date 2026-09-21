import { Injectable } from '@angular/core';
import { Observable, forkJoin, from, of } from 'rxjs';
import { catchError, map, mergeMap, toArray } from 'rxjs/operators';

const SUBJECT_STATS_CONCURRENCY = 4;
import { API, apiPath } from './api/api.const';
import { CurriculumCatalogService } from './curriculum-catalog.service';
import { mapHttpError } from './http-error';
import { NetworkService } from './network.service';

export interface TicketSnapshot {
  id: number;
  status: number;
  userId?: number | null;
  learningObjectiveId: number;
  subjectId: number;
}

export interface LoStats {
  idle: number;
  running: number;
  done: number;
  total: number;
}

export interface SubjectTicketStats {
  subjectId: number;
  tickets: TicketSnapshot[];
  loStats: LoStats;
  progressPercent: number;
}

export interface AggregatedTicketStats {
  bySubject: Map<number, SubjectTicketStats>;
  allTickets: TicketSnapshot[];
  activeTaskCount: number;
  tasksByUser: Map<number, number>;
  tasksBySubject: Map<number, number>;
  memberCounts: {
    assigned: number;
    inProgress: number;
    done: number;
    overdue: number;
  };
}

interface TicketDto {
  id: number;
  status: number;
  userId?: number | null;
  learningObjectiveId: number;
}

@Injectable({ providedIn: 'root' })
export class TicketStatsService {
  constructor(
    private network: NetworkService,
    private catalog: CurriculumCatalogService,
  ) {}

  aggregateForSubjects(subjectIds: number[], memberUserId?: number): Observable<AggregatedTicketStats> {
    const uniqueIds = [...new Set(subjectIds)];
    if (!uniqueIds.length) {
      return of(this.emptyAggregate());
    }

    return from(uniqueIds).pipe(
      mergeMap(
        (subjectId) =>
          this.loadSubjectStats(subjectId).pipe(catchError(() => of(this.emptySubjectStats(subjectId)))),
        SUBJECT_STATS_CONCURRENCY,
      ),
      toArray(),
      map((rows) => this.mergeStats(rows, memberUserId)),
    );
  }

  loadSubjectStats(subjectId: number): Observable<SubjectTicketStats> {
    return forkJoin({
      tickets: this.network
        .get<TicketDto[]>(apiPath(API.Tickets.ListBySubject, { id: subjectId }))
        .pipe(catchError(() => of([] as TicketDto[]))),
      los: this.catalog.getLosForSubject(subjectId).pipe(catchError(() => of([]))),
    }).pipe(
      map(({ tickets, los }) => {
        const snapshots = tickets.map((ticket) => ({
          id: ticket.id,
          status: ticket.status,
          userId: ticket.userId,
          learningObjectiveId: ticket.learningObjectiveId,
          subjectId,
        }));
        const loStats = this.classifyLos(los.map((lo) => lo.id), snapshots);
        const progressPercent = loStats.total ? Math.round((loStats.done / loStats.total) * 100) : 0;
        return { subjectId, tickets: snapshots, loStats, progressPercent };
      }),
      catchError(mapHttpError),
    );
  }

  private classifyLos(loIds: number[], tickets: TicketSnapshot[]): LoStats {
    const ticketByLo = new Map<number, TicketSnapshot>();
    for (const ticket of tickets) {
      ticketByLo.set(ticket.learningObjectiveId, ticket);
    }

    let idle = 0;
    let running = 0;
    let done = 0;
    for (const loId of loIds) {
      const ticket = ticketByLo.get(loId);
      if (!ticket || ticket.status <= 1) {
        idle += 1;
      } else if (ticket.status === 2) {
        running += 1;
      } else if (ticket.status === 3) {
        done += 1;
      } else {
        idle += 1;
      }
    }

    return { idle, running, done, total: loIds.length };
  }

  private mergeStats(rows: SubjectTicketStats[], memberUserId?: number): AggregatedTicketStats {
    const bySubject = new Map<number, SubjectTicketStats>();
    const tasksByUser = new Map<number, number>();
    const tasksBySubject = new Map<number, number>();
    const allTickets: TicketSnapshot[] = [];
    let activeTaskCount = 0;

    for (const row of rows) {
      bySubject.set(row.subjectId, row);
      tasksBySubject.set(row.subjectId, row.tickets.length);
      for (const ticket of row.tickets) {
        allTickets.push(ticket);
        if (ticket.status === 1 || ticket.status === 2) {
          activeTaskCount += 1;
        }
        if (ticket.userId) {
          tasksByUser.set(ticket.userId, (tasksByUser.get(ticket.userId) ?? 0) + 1);
        }
      }
    }

    const memberTickets = memberUserId
      ? allTickets.filter((ticket) => ticket.userId === memberUserId)
      : [];

    return {
      bySubject,
      allTickets,
      activeTaskCount,
      tasksByUser,
      tasksBySubject,
      memberCounts: {
        assigned: memberTickets.filter((ticket) => ticket.status <= 2 || ticket.status === 4).length,
        inProgress: memberTickets.filter((ticket) => ticket.status === 2).length,
        done: memberTickets.filter((ticket) => ticket.status === 3).length,
        // Overdue cannot be computed until tickets expose a due date.
        overdue: 0,
      },
    };
  }

  private emptySubjectStats(subjectId: number): SubjectTicketStats {
    return {
      subjectId,
      tickets: [],
      loStats: { idle: 0, running: 0, done: 0, total: 0 },
      progressPercent: 0,
    };
  }

  private emptyAggregate(): AggregatedTicketStats {
    return {
      bySubject: new Map(),
      allTickets: [],
      activeTaskCount: 0,
      tasksByUser: new Map(),
      tasksBySubject: new Map(),
      memberCounts: { assigned: 0, inProgress: 0, done: 0, overdue: 0 },
    };
  }
}
