import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { PermissionCodes } from '@core/models/permission-codes';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { LeaveKind, LeaveQueueFilters, LeaveQueueItem, LeaveStatus } from '../domain/entity/leave-calendar.entity';
import { BulkDecideLeaveUseCase } from '../domain/usecase/bulk-decide-leave.usecase';
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
  readonly selectedIds = signal<number[]>([]);
  readonly canFinalApprove: boolean;
  readonly leaveTypes = ['Annual', 'Sick', 'Emergency', 'UnpaidLeave', 'FromNextBalance'];
  readonly permissionTypes = ['EarlyDeparture', 'LateArrival', 'WorkAssignment', 'Departure'];

  constructor(
    private auth: AuthService,
    private queueUseCase: GetLeaveQueueUseCase,
    private detailsUseCase: GetLeaveDetailsUseCase,
    private decideUseCase: DecideLeaveUseCase,
    private bulkDecideUseCase: BulkDecideLeaveUseCase,
  ) {
    this.canFinalApprove =
      this.auth.hasPermission(PermissionCodes.HrLeave.Manage) ||
      this.auth.hasPermission(PermissionCodes.HrTimeoff.Manage) ||
      this.auth.hasPermission(PermissionCodes.HrWorkFromHome.Manage) ||
      this.auth.hasPermission(PermissionCodes.HrForgotClock.Manage);
  }

  ngOnInit(): void {
    this.load();
  }

  setTab(tab: LeaveKind): void {
    this.tab = tab;
    this.type = '';
    this.selectedIds.set([]);
    this.load();
  }

  load(): void {
    const filters: LeaveQueueFilters = {
      status: this.status,
      type: this.type,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
    };
    this.queueUseCase.execute({ kind: this.tab, filters }).subscribe((rows) => {
      this.rows.set(rows);
      this.selectedIds.set([]);
    });
  }

  open(row: LeaveQueueItem): void {
    this.comment = '';
    this.detailsUseCase.execute({ kind: row.kind, id: row.id }).subscribe((item) => this.selected.set(item));
  }

  toggleId(id: number, checked: boolean): void {
    if (checked) {
      this.selectedIds.set([...new Set([...this.selectedIds(), id])]);
      return;
    }
    this.selectedIds.set(this.selectedIds().filter((item) => item !== id));
  }

  isSelected(id: number): boolean {
    return this.selectedIds().includes(id);
  }

  decide(approved: boolean, row?: LeaveQueueItem, asOwner = false): void {
    const item = row ?? this.selected();
    if (!item) {
      return;
    }
    this.decideUseCase
      .execute({ kind: item.kind, id: item.id, approved, comment: this.comment || undefined, asOwner })
      .subscribe({
        next: () => {
          toast.success(asOwner ? 'Final approval recorded' : approved ? 'Approved' : 'Rejected');
          this.selected.set(null);
          this.load();
        },
        error: (err: Error) => toast.error(err.message),
      });
  }

  bulkDecide(approved: boolean): void {
    const ids = this.selectedIds();
    if (!ids.length) {
      toast.error('Select at least one request');
      return;
    }
    this.bulkDecideUseCase
      .execute({ kind: this.tab, ids, approved, comment: this.comment || undefined })
      .subscribe({
        next: () => {
          toast.success(approved ? 'Bulk approved' : 'Bulk rejected');
          this.load();
        },
        error: (err: Error) => toast.error(err.message),
      });
  }
}
