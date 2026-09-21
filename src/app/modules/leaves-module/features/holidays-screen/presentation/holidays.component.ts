import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { PermissionCodes } from '@core/models/permission-codes';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { HolidayEntity, HolidayFormPayload } from '../domain/entity/holidays.entity';
import { DeleteHolidayUseCase, ListHolidaysUseCase, SaveHolidayUseCase } from '../domain/usecase/holidays.usecase';

@Component({
  selector: 'app-holidays',
  imports: [FormsModule, PageHeaderComponent, ButtonComponent],
  templateUrl: './holidays.component.html',
})
export class HolidaysComponent implements OnInit {
  readonly rows = signal<HolidayEntity[]>([]);
  readonly showForm = signal(false);
  readonly confirm = signal<{ id: number; name: string; dates: string } | null>(null);
  readonly canManage: boolean;
  formError = '';
  form: HolidayFormPayload = this.emptyForm();

  constructor(
    private auth: AuthService,
    private listUseCase: ListHolidaysUseCase,
    private saveUseCase: SaveHolidayUseCase,
    private deleteUseCase: DeleteHolidayUseCase,
  ) {
    this.canManage = this.auth.hasPermission(PermissionCodes.HrHolidays.Manage);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.listUseCase.execute().subscribe({
      next: (rows) => this.rows.set(rows),
      error: (err: Error) => toast.error(err.message),
    });
  }

  openCreate(): void {
    this.form = this.emptyForm();
    this.formError = '';
    this.showForm.set(true);
  }

  openEdit(row: HolidayEntity): void {
    this.form = { id: row.id, name: row.name, description: row.description ?? '', startDate: row.startDate, endDate: row.endDate };
    this.formError = '';
    this.showForm.set(true);
  }

  save(): void {
    if (!this.form.name.trim() || !this.form.startDate || !this.form.endDate) {
      this.formError = 'Name and dates are required';
      return;
    }
    this.saveUseCase.execute(this.form).subscribe({
      next: () => {
        toast.success(this.form.id ? 'Holiday updated' : 'Holiday created');
        this.showForm.set(false);
        this.load();
      },
      error: (err: Error) => (this.formError = err.message),
    });
  }

  askRemove(row: HolidayEntity): void {
    this.confirm.set({
      id: row.id,
      name: row.name,
      dates: `${row.startDate} – ${row.endDate}`,
    });
  }

  confirmRemove(): void {
    const item = this.confirm();
    if (!item) {
      return;
    }
    this.deleteUseCase.execute(item.id).subscribe({
      next: () => {
        toast.success('Holiday deleted');
        this.confirm.set(null);
        this.load();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  private emptyForm(): HolidayFormPayload {
    return { name: '', description: '', startDate: '', endDate: '' };
  }
}
