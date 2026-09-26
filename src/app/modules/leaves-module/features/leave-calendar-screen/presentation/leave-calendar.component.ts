import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { PermissionCodes } from '@core/models/permission-codes';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { PagerComponent } from '@shared/component/pager/pager.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';
import {
  LEAVE_QUEUE_PAGE_SIZE,
  LeaveKind,
  LeaveQueueFilters,
  LeaveQueueItem,
  LeaveStatus,
} from '../domain/entity/leave-calendar.entity';
import { BulkDecideLeaveUseCase } from '../domain/usecase/bulk-decide-leave.usecase';
import { DecideLeaveUseCase } from '../domain/usecase/decide-leave.usecase';
import { GetLeaveDetailsUseCase } from '../domain/usecase/get-leave-details.usecase';
import { GetLeaveQueueUseCase } from '../domain/usecase/get-leave-queue.usecase';

@Component({
  selector: 'app-leave-calendar',
  imports: [FormsModule, PageHeaderComponent, ButtonComponent, PagerComponent, TableSkeletonComponent],
  templateUrl: './leave-calendar.component.html',
})
export class LeaveCalendarComponent implements OnInit {
  tab: LeaveKind = 'leave';
  status: LeaveStatus | '' = 'Pending';
  type = '';
  dateFrom = '';
  dateTo = '';
  comment = '';
  bulkComment = '';

  readonly page = signal(1);
  readonly pageSize = LEAVE_QUEUE_PAGE_SIZE;
  readonly totalCount = signal(0);
  readonly loading = signal(true);
  readonly bulkBusy = signal(false);
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

  get canBulkOpinion(): boolean {
    switch (this.tab) {
      case 'leave':
        return this.auth.hasPermission(PermissionCodes.HrLeave.Manage);
      case 'permission':
        return this.auth.hasPermission(PermissionCodes.HrTimeoff.Manage);
      case 'wfh':
        return this.auth.hasPermission(PermissionCodes.HrWorkFromHome.Manage);
      case 'forgotClock':
        return this.auth.hasPermission(PermissionCodes.HrForgotClock.Manage);
    }
  }

  pendingRows(): LeaveQueueItem[] {
    return this.rows().filter((row) => row.status === 'Pending');
  }

  setTab(tab: LeaveKind): void {
    this.tab = tab;
    this.type = '';
    this.selectedIds.set([]);
    this.bulkComment = '';
    this.page.set(1);
    this.load();
  }

  onFilterChange(): void {
    this.page.set(1);
    this.load();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const filters: LeaveQueueFilters = {
      status: this.status,
      type: this.type,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      page: this.page(),
      pageSize: this.pageSize,
    };
    this.queueUseCase.execute({ kind: this.tab, filters }).subscribe({
      next: (page) => {
        this.rows.set(page.items);
        this.totalCount.set(page.totalCount);
        this.selectedIds.set([]);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
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

  toggleAll(checked: boolean): void {
    if (!checked) {
      this.selectedIds.set([]);
      return;
    }
    this.selectedIds.set(this.pendingRows().map((row) => row.id));
  }

  isSelected(id: number): boolean {
    return this.selectedIds().includes(id);
  }

  allPendingSelected(): boolean {
    const pending = this.pendingRows();
    return pending.length > 0 && pending.every((row) => this.isSelected(row.id));
  }

  somePendingSelected(): boolean {
    const pending = this.pendingRows();
    const selectedCount = pending.filter((row) => this.isSelected(row.id)).length;
    return selectedCount > 0 && selectedCount < pending.length;
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
    this.bulkBusy.set(true);
    this.bulkDecideUseCase
      .execute({ kind: this.tab, ids, approved, comment: this.bulkComment.trim() || undefined })
      .subscribe({
        next: (result) => {
          this.bulkBusy.set(false);
          this.bulkComment = '';
          if (result.failed > 0) {
            toast.warning(`${result.succeeded} opinion(s) recorded, ${result.failed} failed`);
          } else {
            toast.success(`${result.succeeded} bulk opinion(s) ${approved ? 'approved' : 'rejected'}`);
          }
          this.load();
        },
        error: (err: Error) => {
          this.bulkBusy.set(false);
          toast.error(err.message);
        },
      });
  }
}
