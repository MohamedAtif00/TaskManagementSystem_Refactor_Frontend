import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { TicketStatsResponse } from '@core/api/tms-contracts';
import { API } from './api/api.const';
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

@Injectable({ providedIn: 'root' })
export class TicketStatsService {
  private snapshotCache = new Map<string, Observable<{ tickets: TicketSnapshot[]; los: { id: number; subjectId: number }[] }>>();

  constructor(private network: NetworkService) {}

  aggregateForSubjects(subjectIds: number[], memberUserId?: number): Observable<AggregatedTicketStats> {
    const uniqueIds = [...new Set(subjectIds)];
    return this.loadSnapshot({ subjectIds: uniqueIds }).pipe(
      map((snapshot) => this.mergeStats(snapshot, uniqueIds, memberUserId)),
    );
  }

  loadSubjectStats(subjectId: number): Observable<SubjectTicketStats> {
    return this.aggregateForSubjects([subjectId]).pipe(
      map((aggregate) => aggregate.bySubject.get(subjectId) ?? this.emptySubjectStats(subjectId)),
    );
  }

  progressForLos(loIds: number[]): Observable<number> {
    if (!loIds.length) {
      return of(0);
    }
    return this.loadSnapshot({ learningObjectiveIds: loIds }).pipe(
      map((snapshot) => {
        const stats = this.classifyLos(loIds, snapshot.tickets);
        return stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
      }),
    );
  }

  invalidate(): void {
    this.snapshotCache.clear();
  }

  private loadSnapshot(filters: {
    subjectIds?: number[];
    learningObjectiveIds?: number[];
  }): Observable<{ tickets: TicketSnapshot[]; los: { id: number; subjectId: number }[] }> {
    const cacheKey = this.buildCacheKey(filters);
    const cached = this.snapshotCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    let params = new HttpParams();
    for (const id of filters.subjectIds ?? []) {
      params = params.append('subjectId', String(id));
    }
    for (const id of filters.learningObjectiveIds ?? []) {
      params = params.append('learningObjectiveId', String(id));
    }

    const request$ = this.network.get<TicketStatsResponse>(API.Tickets.Stats, params).pipe(
      map((response) => ({
        tickets: (response.tickets ?? []).map((ticket) => ({
          id: ticket.id,
          status: ticket.status,
          userId: ticket.userId,
          learningObjectiveId: ticket.learningObjectiveId,
          subjectId: ticket.subjectId,
        })),
        los: response.learningObjectives ?? [],
      })),
      catchError(mapHttpError),
      shareReplay(1),
    );

    this.snapshotCache.set(cacheKey, request$);
    return request$;
  }

  private buildCacheKey(filters: {
    subjectIds?: number[];
    learningObjectiveIds?: number[];
  }): string {
    const subjects = [...(filters.subjectIds ?? [])].sort((a, b) => a - b).join(',');
    const los = [...(filters.learningObjectiveIds ?? [])].sort((a, b) => a - b).join(',');
    return `s:${subjects}|lo:${los}`;
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

  private mergeStats(
    snapshot: { tickets: TicketSnapshot[]; los: { id: number; subjectId: number }[] },
    subjectIds: number[],
    memberUserId?: number,
  ): AggregatedTicketStats {
    const subjectFilter = subjectIds.length ? new Set(subjectIds) : null;
    const tickets = subjectFilter
      ? snapshot.tickets.filter((ticket) => subjectFilter.has(ticket.subjectId))
      : snapshot.tickets;
    const los = subjectFilter
      ? snapshot.los.filter((lo) => subjectFilter.has(lo.subjectId))
      : snapshot.los;

    const ticketsBySubject = new Map<number, TicketSnapshot[]>();
    const losBySubject = new Map<number, number[]>();
    const tasksByUser = new Map<number, number>();
    const tasksBySubject = new Map<number, number>();
    let activeTaskCount = 0;

    for (const lo of los) {
      const ids = losBySubject.get(lo.subjectId) ?? [];
      ids.push(lo.id);
      losBySubject.set(lo.subjectId, ids);
    }

    for (const ticket of tickets) {
      const subjectTickets = ticketsBySubject.get(ticket.subjectId) ?? [];
      subjectTickets.push(ticket);
      ticketsBySubject.set(ticket.subjectId, subjectTickets);
      if (ticket.status === 1 || ticket.status === 2) {
        activeTaskCount += 1;
      }
      if (ticket.userId) {
        tasksByUser.set(ticket.userId, (tasksByUser.get(ticket.userId) ?? 0) + 1);
      }
    }

    const ids = subjectFilter ? [...subjectFilter] : [...new Set([...ticketsBySubject.keys(), ...losBySubject.keys()])];
    const bySubject = new Map<number, SubjectTicketStats>();
    for (const subjectId of ids) {
      const subjectTickets = ticketsBySubject.get(subjectId) ?? [];
      const loStats = this.classifyLos(losBySubject.get(subjectId) ?? [], subjectTickets);
      bySubject.set(subjectId, {
        subjectId,
        tickets: subjectTickets,
        loStats,
        progressPercent: loStats.total ? Math.round((loStats.done / loStats.total) * 100) : 0,
      });
      tasksBySubject.set(subjectId, subjectTickets.length);
    }

    const memberTickets = memberUserId ? tickets.filter((ticket) => ticket.userId === memberUserId) : [];

    return {
      bySubject,
      allTickets: tickets,
      activeTaskCount,
      tasksByUser,
      tasksBySubject,
      memberCounts: {
        assigned: memberTickets.filter((ticket) => ticket.status <= 2 || ticket.status === 4).length,
        inProgress: memberTickets.filter((ticket) => ticket.status === 2).length,
        done: memberTickets.filter((ticket) => ticket.status === 3).length,
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
}
