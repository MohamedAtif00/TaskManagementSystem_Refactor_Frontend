import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { toast } from 'ngx-sonner';
import { AuthService } from '@core/services/auth.service';
import {
  formatWorkDayTime,
  isValidWorkDayRange,
  isWithinEarlyDepartureSlot,
  isWithinLateArrivalSlot,
  isWithinWorkDay,
  WORK_DAY_END,
  WORK_DAY_START,
} from '@core/hr/work-day-hours';
import { countWorkingDays } from '@core/hr/working-days';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { StatCardComponent } from '@shared/component/stat-card/stat-card.component';
import { StatCardsSkeletonComponent } from '@shared/component/skeleton/stat-cards-skeleton.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';
import { WorkDayTimePickerComponent } from '@shared/component/work-day-time-picker/work-day-time-picker.component';
import {
  ForgotClockPunchType,
  ForgotClockRequestEntity,
  LeaveKind,
  LeavePreviewEntity,
  LeaveRequestEntity,
  LeaveStatus,
  LeaveType,
  MyLeavesEntity,
  PermissionRequestEntity,
  PermissionType,
  WfhRequestEntity,
} from '../domain/entity/my-leaves.entity';
import { CancelLeaveUseCase } from '../domain/usecase/cancel-leave.usecase';
import { CreateForgotClockUseCase } from '../domain/usecase/create-forgot-clock.usecase';
import { CreateLeaveUseCase } from '../domain/usecase/create-leave.usecase';
import { CreatePermissionUseCase } from '../domain/usecase/create-permission.usecase';
import { CreateWfhUseCase } from '../domain/usecase/create-wfh.usecase';
import { GetMyLeavesUseCase } from '../domain/usecase/get-my-leaves.usecase';
import { PreviewLeaveUseCase } from '../domain/usecase/preview-leave.usecase';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  Annual: 'Annual leave',
  Sick: 'Sick leave',
  Emergency: 'Emergency leave',
  UnpaidLeave: 'Unpaid leave',
  FromNextBalance: 'From next balance',
};

const PERMISSION_TYPE_LABELS: Record<PermissionType, string> = {
  EarlyDeparture: 'Early departure',
  LateArrival: 'Late arrival',
  WorkAssignment: 'Work assignment',
  Departure: 'Departure',
};

const PUNCH_TYPE_LABELS: Record<ForgotClockPunchType, string> = {
  In: 'Clock in',
  Out: 'Clock out',
};

@Component({
  selector: 'app-my-leaves',
  imports: [
    FormsModule,
    PageHeaderComponent,
    ButtonComponent,
    StatCardComponent,
    WorkDayTimePickerComponent,
    StatCardsSkeletonComponent,
    TableSkeletonComponent,
  ],
  templateUrl: './my-leaves.component.html',
})
export class MyLeavesComponent implements OnInit, OnDestroy {
  tab: LeaveKind = 'leave';
  formKind: LeaveKind = 'leave';
  readonly loading = signal(true);
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
  punchType: ForgotClockPunchType = 'In';
  forgotDate = '';
  forgotTime = '09:00';
  forgotReason = '';
  medicalFile: File | null = null;
  confirmFromNext = false;
  leavePreview: LeavePreviewEntity | null = null;
  private previewSub?: Subscription;
  private lastPreviewKey = '';

  readonly leaveTypes: LeaveType[] = ['Annual', 'Sick', 'Emergency', 'UnpaidLeave', 'FromNextBalance'];
  readonly permissionTypes: PermissionType[] = ['EarlyDeparture', 'LateArrival', 'WorkAssignment', 'Departure'];
  readonly punchTypes: ForgotClockPunchType[] = ['In', 'Out'];
  readonly leaveTypeLabels = LEAVE_TYPE_LABELS;
  readonly permissionTypeLabels = PERMISSION_TYPE_LABELS;
  readonly punchTypeLabels = PUNCH_TYPE_LABELS;
  readonly formatTime = formatWorkDayTime;

  readonly upcomingLeaves = computed(() => this.splitLeaves(true));
  readonly earlierLeaves = computed(() => this.splitLeaves(false));
  readonly upcomingPermissions = computed(() => this.splitPermissions(true));
  readonly earlierPermissions = computed(() => this.splitPermissions(false));
  readonly upcomingWfh = computed(() => this.splitWfh(true));
  readonly earlierWfh = computed(() => this.splitWfh(false));
  readonly upcomingForgot = computed(() => this.splitForgot(true));
  readonly earlierForgot = computed(() => this.splitForgot(false));

  constructor(
    private auth: AuthService,
    private getMine: GetMyLeavesUseCase,
    private createLeave: CreateLeaveUseCase,
    private createPermission: CreatePermissionUseCase,
    private createWfh: CreateWfhUseCase,
    private createForgotClock: CreateForgotClockUseCase,
    private previewLeave: PreviewLeaveUseCase,
    private cancelUseCase: CancelLeaveUseCase,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const userId = this.auth.user()?.id;
    if (!userId) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.getMine.execute(userId).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
    });
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

  formatTimeRange(fromTime: string, toTime: string): string {
    return `${formatWorkDayTime(fromTime)}–${formatWorkDayTime(toTime)}`;
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
      const days = this.leavePreview?.requestedDays ?? countWorkingDays(this.leaveStart, this.leaveEnd);
      return `${days} day${days === 1 ? '' : 's'}`;
    }
    if (this.formKind === 'permission') {
      const hours = this.hoursBetween(this.fromTime, this.toTime);
      if (hours <= 0) {
        return '';
      }
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    if (this.formKind === 'forgotClock') {
      return this.forgotDate
        ? `${this.punchTypeLabels[this.punchType]} · ${formatWorkDayTime(this.forgotTime)}`
        : '';
    }
    return this.wfhDate ? '1 day' : '';
  }

  remainingPreview(): string {
    const balances = this.data()?.balances;
    if (!balances) {
      return '';
    }
    if (this.formKind === 'leave') {
      if (this.leavePreview && (this.leaveType === 'Annual' || this.leaveType === 'FromNextBalance')) {
        return `${this.leavePreview.availableAnnual} annual left`;
      }
      if (this.leaveType === 'Annual') {
        return this.ratio(balances.annualUsed, balances.annualMax);
      }
      if (this.leaveType === 'Emergency') {
        return this.ratio(balances.emergencyUsed, balances.emergencyMax);
      }
      if (this.leaveType === 'Sick') {
        return String(balances.sickUsed);
      }
      if (this.leaveType === 'FromNextBalance') {
        return this.ratio(balances.fromNextUsed, balances.fromNextMax);
      }
      return 'Unpaid leave does not use a balance';
    }
    if (this.formKind === 'permission') {
      return this.ratio(balances.permissionUsed, balances.permissionMax);
    }
    if (this.formKind === 'forgotClock') {
      return 'Forgot-clock requests do not use a balance';
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
    this.resetPermissionTimes();
    this.permissionReason = '';
    this.wfhDate = '';
    this.wfhNote = '';
    this.punchType = 'In';
    this.forgotDate = '';
    this.forgotTime = '09:00';
    this.forgotReason = '';
    this.medicalFile = null;
    this.confirmFromNext = false;
    this.leavePreview = null;
    this.lastPreviewKey = '';
    this.previewSub?.unsubscribe();
    this.showForm.set(true);
  }

  onPermissionTypeChange(): void {
    this.resetPermissionTimes();
  }

  resetPermissionTimes(): void {
    if (this.permissionType === 'EarlyDeparture') {
      this.fromTime = '15:00';
      this.toTime = WORK_DAY_END;
      return;
    }
    if (this.permissionType === 'LateArrival') {
      this.fromTime = WORK_DAY_START;
      this.toTime = '10:00';
      return;
    }
    this.fromTime = WORK_DAY_START;
    this.toTime = '11:00';
  }

  onMedicalSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.medicalFile = input.files?.[0] ?? null;
  }

  onLeaveDatesChange(): void {
    if (!this.leaveStart || !this.leaveEnd || this.leaveEnd < this.leaveStart) {
      this.leavePreview = null;
      this.lastPreviewKey = '';
      this.previewSub?.unsubscribe();
      return;
    }
    this.runPreview(true);
  }

  runPreview(silent = false): void {
    this.formError = '';
    if (!this.leaveStart || !this.leaveEnd) {
      if (!silent) {
        this.formError = 'Start and end dates are required to preview';
      }
      return;
    }
    const key = `${this.leaveStart}|${this.leaveEnd}`;
    if (silent && key === this.lastPreviewKey && this.leavePreview) {
      return;
    }
    this.lastPreviewKey = key;
    this.previewSub?.unsubscribe();
    this.previewSub = this.previewLeave.execute({ startDate: this.leaveStart, endDate: this.leaveEnd }).subscribe({
      next: (preview) => {
        this.leavePreview = preview;
        if (preview.errorMessage) {
          this.formError = preview.errorMessage;
        }
      },
      error: (err: Error) => {
        this.leavePreview = null;
        this.formError = err.message;
      },
    });
  }

  ngOnDestroy(): void {
    this.previewSub?.unsubscribe();
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
      if (this.leaveType === 'Sick' && !this.medicalFile) {
        this.formError = 'A medical certificate is required for sick leave';
        return;
      }
      if (this.leavePreview?.requiresConfirmation && !this.confirmFromNext) {
        this.formError = 'Confirm using next-year balance before submitting';
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
            confirmFromNextBalance: this.confirmFromNext,
            medicalCertificate: this.medicalFile,
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
      const permissionError = this.validatePermissionTimes();
      if (permissionError) {
        this.formError = permissionError;
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
    if (this.formKind === 'wfh') {
      if (!this.wfhDate) {
        this.formError = 'Date is required';
        return;
      }
      this.createWfh.execute({ userId, payload: { date: this.wfhDate, note: this.wfhNote || undefined } }).subscribe({
        next: () => this.afterSave('wfh'),
        error: (err: Error) => (this.formError = err.message),
      });
      return;
    }
    if (!this.forgotDate) {
      this.formError = 'Date is required';
      return;
    }
    if (!isWithinWorkDay(this.forgotTime)) {
      this.formError = 'Intended time must be between 9:00 AM and 5:00 PM';
      return;
    }
    this.createForgotClock
      .execute({
        userId,
        payload: {
          punchType: this.punchType,
          attendanceDate: this.forgotDate,
          intendedTime: this.forgotTime,
          reason: this.forgotReason || undefined,
        },
      })
      .subscribe({
        next: () => this.afterSave('forgotClock'),
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

  private splitForgot(upcoming: boolean): ForgotClockRequestEntity[] {
    return (this.data()?.forgotClock ?? []).filter(
      (row) => this.isUpcoming(row.status, row.attendanceDate) === upcoming,
    );
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private validatePermissionTimes(): string {
    if (this.permissionType === 'EarlyDeparture') {
      this.toTime = WORK_DAY_END;
      if (!isWithinEarlyDepartureSlot(this.fromTime)) {
        return 'Leaving time must be between 1:00 PM and 4:00 PM';
      }
    } else if (this.permissionType === 'LateArrival') {
      this.fromTime = WORK_DAY_START;
      if (!isWithinLateArrivalSlot(this.toTime)) {
        return 'Arrival time must be between 10:00 AM and 1:00 PM';
      }
    }
    if (!isValidWorkDayRange(this.fromTime, this.toTime)) {
      return 'Choose a valid time range within work hours (9:00 AM – 5:00 PM)';
    }
    return '';
  }

  private hoursBetween(fromTime: string, toTime: string): number {
    const [fromH, fromM] = fromTime.split(':').map(Number);
    const [toH, toM] = toTime.split(':').map(Number);
    return Math.round((toH + toM / 60 - (fromH + fromM / 60)) * 10) / 10;
  }
}
