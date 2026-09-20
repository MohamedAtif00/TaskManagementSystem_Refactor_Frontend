import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { environment } from '@environments/environment';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { LeaveKind, LeaveQueueFilters, LeaveQueueItem, LeaveStatus } from '../domain/entity/leave-calendar.entity';
import { DecideLeaveUseCase } from '../domain/usecase/decide-leave.usecase';
import { GetLeaveDetailsUseCase } from '../domain/usecase/get-leave-details.usecase';
import { GetLeaveQueueUseCase } from '../domain/usecase/get-leave-queue.usecase';

@Component({
  selector: 'app-leave-calendar',
  imports: [FormsModule, PageHeaderComponent, ButtonComponent],
  templateUrl: './leave-calendar.component.html',
})
export class LeaveCalendarComponent implements OnInit {
  tab: LeaveKind = 'leave';
  status: LeaveStatus | '' = 'Pending';
  type = '';
  dateFrom = '';
  dateTo = '';
  comment = '';
  readonly rows = signal<LeaveQueueItem[]>([]);
  readonly selected = signal<LeaveQueueItem | null>(null);
  readonly leaveTypes = ['Annual', 'Sick', 'Emergency', 'UnpaidLeave'];
  readonly permissionTypes = environment.useMock
    ? ['EarlyDeparture', 'LateArrival', 'WorkAssignment', 'Departure']
    : ['EarlyDeparture', 'LateArrival'];

  constructor(
    private queueUseCase: GetLeaveQueueUseCase,
    private detailsUseCase: GetLeaveDetailsUseCase,
    private decideUseCase: DecideLeaveUseCase,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  setTab(tab: LeaveKind): void {
    this.tab = tab;
    this.type = '';
    this.load();
  }

  load(): void {
    const filters: LeaveQueueFilters = {
      status: this.status,
      type: this.type,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
    };
    this.queueUseCase.execute({ kind: this.tab, filters }).subscribe((rows) => this.rows.set(rows));
  }

  open(row: LeaveQueueItem): void {
    this.comment = '';
    this.detailsUseCase.execute({ kind: row.kind, id: row.id }).subscribe((item) => this.selected.set(item));
  }

  decide(approved: boolean, row?: LeaveQueueItem): void {
    const item = row ?? this.selected();
    if (!item) {
      return;
    }
    this.decideUseCase
      .execute({ kind: item.kind, id: item.id, approved, comment: this.comment || undefined })
      .subscribe({
        next: () => {
          toast.success(approved ? 'Approved' : 'Rejected');
          this.selected.set(null);
          this.load();
        },
        error: (err: Error) => toast.error(err.message),
      });
  }
}
