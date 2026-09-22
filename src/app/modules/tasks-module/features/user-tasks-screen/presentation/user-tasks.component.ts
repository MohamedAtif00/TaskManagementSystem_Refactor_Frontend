import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { toast } from 'ngx-sonner';
import { TicketSnapshot, TicketStatsService } from '@core/network/ticket-stats.service';
import { DirectoryUser, UserDirectoryService } from '@core/network/user-directory.service';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { downloadCsv } from '@core/utils/csv-export';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';
import { TASK_STATUS_LABELS } from '../../task-board-screen/domain/entity/task-board.entity';

interface UserWorkloadRow {
  id: number;
  name: string;
  teamName: string;
  todoCount: number;
  doingCount: number;
  totalActive: number;
}

@Component({
  selector: 'app-user-tasks',
  imports: [PageHeaderComponent, ButtonComponent, TableSkeletonComponent],
  templateUrl: './user-tasks.component.html',
})
export class UserTasksComponent implements OnInit {
  private readonly ticketStats = inject(TicketStatsService);
  private readonly users = inject(UserDirectoryService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly rows = signal<UserWorkloadRow[]>([]);
  readonly selectedUserId = signal<number | null>(null);
  readonly userTickets = signal<TicketSnapshot[]>([]);
  readonly statusLabels = TASK_STATUS_LABELS;

  readonly selectedUser = computed(() => {
    const id = this.selectedUserId();
    return id ? this.rows().find((row) => row.id === id) : undefined;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    forkJoin({
      users: this.users.list(),
      stats: this.ticketStats.aggregateForSubjects([]),
    }).subscribe({
      next: ({ users, stats }) => {
        this.rows.set(this.buildRows(users, stats.allTickets));
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
    });
  }

  openUser(row: UserWorkloadRow): void {
    this.selectedUserId.set(row.id);
    this.ticketStats.aggregateForSubjects([]).subscribe({
      next: (stats) => {
        this.userTickets.set(
          stats.allTickets.filter(
            (ticket) => ticket.userId === row.id && (ticket.status === 1 || ticket.status === 2),
          ),
        );
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  closeDrillDown(): void {
    this.selectedUserId.set(null);
    this.userTickets.set([]);
  }

  openSubject(subjectId: number): void {
    void this.router.navigateByUrl(ROUTE_PATHS.taskBoard(subjectId));
  }

  exportSummary(): void {
    const rows = this.rows();
    if (!rows.length) {
      toast.error('Nothing to export');
      return;
    }
    downloadCsv('user-workload.csv', rows, [
      { header: 'User', value: (row) => row.name },
      { header: 'Team', value: (row) => row.teamName },
      { header: 'To Do', value: (row) => row.todoCount },
      { header: 'Doing', value: (row) => row.doingCount },
      { header: 'Active Total', value: (row) => row.totalActive },
    ]);
    toast.success('Exported user workload');
  }

  statusLabel(status: number): string {
    return this.statusLabels[status as 0 | 1 | 2 | 3 | 4] ?? String(status);
  }

  exportDrillDown(): void {
    const user = this.selectedUser();
    const tickets = this.userTickets();
    if (!user || !tickets.length) {
      toast.error('Nothing to export');
      return;
    }
    downloadCsv(`user-${user.id}-tasks.csv`, tickets, [
      { header: 'Task ID', value: (row) => row.id },
      { header: 'Status', value: (row) => this.statusLabels[row.status as 0 | 1 | 2 | 3 | 4] ?? row.status },
      { header: 'Subject ID', value: (row) => row.subjectId },
      { header: 'LO ID', value: (row) => row.learningObjectiveId },
    ]);
    toast.success('Exported task list');
  }

  private buildRows(users: DirectoryUser[], tickets: TicketSnapshot[]): UserWorkloadRow[] {
    return users
      .map((user) => {
        const assigned = tickets.filter((ticket) => ticket.userId === user.id);
        const todoCount = assigned.filter((ticket) => ticket.status === 1).length;
        const doingCount = assigned.filter((ticket) => ticket.status === 2).length;
        return {
          id: user.id,
          name: user.name,
          teamName: user.teamName ?? '—',
          todoCount,
          doingCount,
          totalActive: todoCount + doingCount,
        };
      })
      .filter((row) => row.totalActive > 0)
      .sort((a, b) => b.totalActive - a.totalActive || a.name.localeCompare(b.name));
  }
}
