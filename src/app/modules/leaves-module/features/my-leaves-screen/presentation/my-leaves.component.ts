import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { environment } from '@environments/environment';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { StatCardComponent } from '@shared/component/stat-card/stat-card.component';
import {
  LeaveKind,
  LeaveRequestEntity,
  LeaveStatus,
  LeaveType,
  MyLeavesEntity,
  PermissionRequestEntity,
  PermissionType,
  WfhRequestEntity,
} from '../domain/entity/my-leaves.entity';
import { CancelLeaveUseCase } from '../domain/usecase/cancel-leave.usecase';
import { CreateLeaveUseCase } from '../domain/usecase/create-leave.usecase';
import { CreatePermissionUseCase } from '../domain/usecase/create-permission.usecase';
import { CreateWfhUseCase } from '../domain/usecase/create-wfh.usecase';
import { GetMyLeavesUseCase } from '../domain/usecase/get-my-leaves.usecase';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  Annual: 'Annual leave',
  Sick: 'Sick leave',
  Emergency: 'Emergency leave',
  UnpaidLeave: 'Unpaid leave',
};

const PERMISSION_TYPE_LABELS: Record<PermissionType, string> = {
  EarlyDeparture: 'Early departure',
  LateArrival: 'Late arrival',
  WorkAssignment: 'Work assignment',
  Departure: 'Departure',
};

@Component({
  selector: 'app-my-leaves',
  imports: [FormsModule, PageHeaderComponent, ButtonComponent, StatCardComponent],
  templateUrl: './my-leaves.component.html',
})
export class MyLeavesComponent implements OnInit {
  tab: LeaveKind = 'leave';
  formKind: LeaveKind = 'leave';
  readonly data = signal<MyLeavesEntity | null>(null);
  readonly showForm = signal(false);
  readonly confirm = signal<{ kind: LeaveKind; id: number; label: string; dates: string } | null>(null);
  formError = '';
  leaveType: LeaveType = 'Annual';
  leaveStart = '';
  leaveEnd = '';
  leaveReason = '';
  permissionType: PermissionType = 'EarlyDeparture';
  permissionDate = '';
  fromTime = '09:00';
  toTime = '11:00';
  permissionReason = '';
  wfhDate = '';
  wfhNote = '';

  readonly leaveTypes: LeaveType[] = ['Annual', 'Sick', 'Emergency', 'UnpaidLeave'];
  readonly permissionTypes: PermissionType[] = environment.useMock
    ? ['EarlyDeparture', 'LateArrival', 'WorkAssignment', 'Departure']
    : ['EarlyDeparture', 'LateArrival'];
  readonly leaveTypeLabels = LEAVE_TYPE_LABELS;
  readonly permissionTypeLabels = PERMISSION_TYPE_LABELS;

  readonly upcomingLeaves = computed(() => this.splitLeaves(true));
  readonly earlierLeaves = computed(() => this.splitLeaves(false));
  readonly upcomingPermissions = computed(() => this.splitPermissions(true));
  readonly earlierPermissions = computed(() => this.splitPermissions(false));
  readonly upcomingWfh = computed(() => this.splitWfh(true));
  readonly earlierWfh = computed(() => this.splitWfh(false));

  constructor(
    private auth: AuthService,
    private getMine: GetMyLeavesUseCase,
    private createLeave: CreateLeaveUseCase,
    private createPermission: CreatePermissionUseCase,
    private createWfh: CreateWfhUseCase,
    private cancelUseCase: CancelLeaveUseCase,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const userId = this.auth.user()?.id;
    if (!userId) {
      return;
    }
    this.getMine.execute(userId).subscribe((data) => this.data.set(data));
  }

  ratio(used: number, max: number): string {
    return `${used}/${max}`;
  }

  canCancel(status: LeaveStatus, start: string): boolean {
    if (status === 'Cancelled' || status === 'Rejected') {
      return false;
    }
    if (status === 'Approved' && start < this.today()) {
      return false;
    }
    return true;
  }

  statusClass(status: LeaveStatus): string {
    const tone =
      status === 'Pending'
        ? 'bg-yellow-500/15 text-yellow-800 dark:text-yellow-300'
        : status === 'Approved'
          ? 'bg-green-500/15 text-green-800 dark:text-green-300'
          : status === 'Rejected'
            ? 'bg-destructive/15 text-destructive'
            : 'bg-muted text-muted-foreground';
    return `rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`;
  }

  formatDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) {
      return value;
    }
    return `${day} ${MONTHS[month - 1]} ${year}`;
  }

  formatRange(start: string, end: string): string {
    if (start === end) {
      return this.formatDate(start);
    }
    const [sy, sm, sd] = start.split('-').map(Number);
    const [ey, em, ed] = end.split('-').map(Number);
    if (sy === ey && sm === em) {
      return `${sd}–${ed} ${MONTHS[sm - 1]} ${sy}`;
    }
    return `${this.formatDate(start)} – ${this.formatDate(end)}`;
  }

  durationPreview(): string {
    if (this.formKind === 'leave') {
      if (!this.leaveStart || !this.leaveEnd || this.leaveEnd < this.leaveStart) {
        return '';
      }
      const days = this.inclusiveDays(this.leaveStart, this.leaveEnd);
      return `${days} day${days === 1 ? '' : 's'}`;
    }
    if (this.formKind === 'permission') {
      const hours = this.hoursBetween(this.fromTime, this.toTime);
      if (hours <= 0) {
        return '';
      }
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    return this.wfhDate ? '1 day' : '';
  }

  remainingPreview(): string {
    const balances = this.data()?.balances;
    if (!balances) {
      return '';
    }
    if (this.formKind === 'leave') {
      if (this.leaveType === 'Annual') {
        return this.ratio(balances.annualUsed, balances.annualMax);
      }
      if (this.leaveType === 'Emergency') {
        return this.ratio(balances.emergencyUsed, balances.emergencyMax);
      }
      if (this.leaveType === 'Sick') {
        return String(balances.sickUsed);
      }
      return 'Unpaid leave does not use a balance';
    }
    if (this.formKind === 'permission') {
      return this.ratio(balances.permissionUsed, balances.permissionMax);
    }
    return this.ratio(balances.wfhUsed, balances.wfhMax);
  }

  openCreate(kind: LeaveKind = this.tab): void {
    this.formKind = kind;
    this.formError = '';
    this.leaveType = 'Annual';
    this.leaveStart = '';
    this.leaveEnd = '';
    this.leaveReason = '';
    this.permissionType = 'EarlyDeparture';
    this.permissionDate = '';
    this.fromTime = '09:00';
    this.toTime = '11:00';
    this.permissionReason = '';
    this.wfhDate = '';
    this.wfhNote = '';
    this.showForm.set(true);
  }

  save(): void {
    const userId = this.auth.user()?.id;
    if (!userId) {
      return;
    }
    this.formError = '';
    if (this.formKind === 'leave') {
      if (!this.leaveStart || !this.leaveEnd) {
        this.formError = 'Start and end dates are required';
        return;
      }
      this.createLeave
        .execute({
          userId,
          payload: {
            type: this.leaveType,
            startDate: this.leaveStart,
            endDate: this.leaveEnd,
            reason: this.leaveReason || undefined,
          },
        })
        .subscribe({
          next: () => this.afterSave('leave'),
          error: (err: Error) => (this.formError = err.message),
        });
      return;
    }
    if (this.formKind === 'permission') {
      if (!this.permissionDate) {
        this.formError = 'Date is required';
        return;
      }
      this.createPermission
        .execute({
          userId,
          payload: {
            type: this.permissionType,
            permissionDate: this.permissionDate,
            fromTime: this.fromTime,
            toTime: this.toTime,
            reason: this.permissionReason || undefined,
          },
        })
        .subscribe({
          next: () => this.afterSave('permission'),
          error: (err: Error) => (this.formError = err.message),
        });
      return;
    }
    if (!this.wfhDate) {
      this.formError = 'Date is required';
      return;
    }
    this.createWfh.execute({ userId, payload: { date: this.wfhDate, note: this.wfhNote || undefined } }).subscribe({
      next: () => this.afterSave('wfh'),
      error: (err: Error) => (this.formError = err.message),
    });
  }

  askCancel(kind: LeaveKind, id: number, label: string, dates: string): void {
    this.confirm.set({ kind, id, label, dates });
  }

  confirmCancel(): void {
    const userId = this.auth.user()?.id;
    const item = this.confirm();
    if (!userId || !item) {
      return;
    }
    this.cancelUseCase.execute({ userId, payload: { kind: item.kind, id: item.id } }).subscribe({
      next: () => {
        toast.success('Request cancelled');
        this.confirm.set(null);
        this.load();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  private afterSave(kind: LeaveKind): void {
    toast.success('Request submitted');
    this.showForm.set(false);
    this.tab = kind;
    this.load();
  }

  private isUpcoming(status: LeaveStatus, start: string): boolean {
    if (status === 'Pending') {
      return true;
    }
    return status === 'Approved' && start >= this.today();
  }

  private splitLeaves(upcoming: boolean): LeaveRequestEntity[] {
    return (this.data()?.leaves ?? []).filter((row) => this.isUpcoming(row.status, row.startDate) === upcoming);
  }

  private splitPermissions(upcoming: boolean): PermissionRequestEntity[] {
    return (this.data()?.permissions ?? []).filter(
      (row) => this.isUpcoming(row.status, row.permissionDate) === upcoming,
    );
  }

  private splitWfh(upcoming: boolean): WfhRequestEntity[] {
    return (this.data()?.wfh ?? []).filter((row) => this.isUpcoming(row.status, row.date) === upcoming);
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private inclusiveDays(startDate: string, endDate: string): number {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
  }

  private hoursBetween(fromTime: string, toTime: string): number {
    const [fromH, fromM] = fromTime.split(':').map(Number);
    const [toH, toM] = toTime.split(':').map(Number);
    return Math.round((toH + toM / 60 - (fromH + fromM / 60)) * 10) / 10;
  }
}
