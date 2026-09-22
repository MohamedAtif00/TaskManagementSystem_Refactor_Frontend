import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { formatWorkDayTime, isWithinWorkDay } from '@core/hr/work-day-hours';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';
import { WorkDayTimePickerComponent } from '@shared/component/work-day-time-picker/work-day-time-picker.component';
import { CreateForgotClockForm, ForgotClockEntity, ForgotClockPunchType } from '../domain/entity/forgot-clock.entity';
import {
  CancelForgotClockUseCase,
  CreateForgotClockRequestUseCase,
  ListForgotClockUseCase,
} from '../domain/usecase/forgot-clock.usecase';

@Component({
  selector: 'app-forgot-clock',
  imports: [FormsModule, PageHeaderComponent, ButtonComponent, WorkDayTimePickerComponent, TableSkeletonComponent],
  templateUrl: './forgot-clock.component.html',
})
export class ForgotClockComponent implements OnInit {
  readonly loading = signal(true);
  readonly rows = signal<ForgotClockEntity[]>([]);
  readonly showForm = signal(false);
  readonly confirm = signal<{ id: number; label: string; dates: string } | null>(null);
  formError = '';
  readonly formatTime = formatWorkDayTime;
  punchType: ForgotClockPunchType = 'In';
  attendanceDate = '';
  intendedTime = '09:00';
  reason = '';

  constructor(
    private listUseCase: ListForgotClockUseCase,
    private createUseCase: CreateForgotClockRequestUseCase,
    private cancelUseCase: CancelForgotClockUseCase,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.listUseCase.execute().subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
    });
  }

  openCreate(): void {
    this.formError = '';
    this.punchType = 'In';
    this.attendanceDate = '';
    this.intendedTime = '09:00';
    this.reason = '';
    this.showForm.set(true);
  }

  save(): void {
    if (!this.attendanceDate) {
      this.formError = 'Date is required';
      return;
    }
    if (!isWithinWorkDay(this.intendedTime)) {
      this.formError = 'Intended time must be between 9:00 AM and 5:00 PM';
      return;
    }
    const payload: CreateForgotClockForm = {
      punchType: this.punchType,
      attendanceDate: this.attendanceDate,
      intendedTime: this.intendedTime,
      reason: this.reason || undefined,
    };
    this.createUseCase.execute(payload).subscribe({
      next: () => {
        toast.success('Request submitted');
        this.showForm.set(false);
        this.load();
      },
      error: (err: Error) => (this.formError = err.message),
    });
  }

  askCancel(row: ForgotClockEntity): void {
    if (row.status !== 'Pending') {
      return;
    }
    this.confirm.set({
      id: row.id,
      label: row.punchType === 'In' ? 'Clock in' : 'Clock out',
      dates: `${row.attendanceDate} · ${formatWorkDayTime(row.intendedTime)}`,
    });
  }

  confirmCancel(): void {
    const item = this.confirm();
    if (!item) {
      return;
    }
    this.cancelUseCase.execute(item.id).subscribe({
      next: () => {
        toast.success('Request cancelled');
        this.confirm.set(null);
        this.load();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }
}
