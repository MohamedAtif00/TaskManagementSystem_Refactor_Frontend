import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { ADMIN_ROLES } from '@core/models/user-role';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';
import { UserBalanceEntity, UserDetailEntity, UserFormOptions, UserFormPayload } from '../domain/entity/user-list.entity';
import { GetUserBalanceUseCase } from '../domain/usecase/get-user-balance.usecase';
import { GetUserUseCase } from '../domain/usecase/get-user.usecase';
import { SaveUserBalanceUseCase } from '../domain/usecase/save-user-balance.usecase';
import { SaveUserUseCase } from '../domain/usecase/save-user.usecase';
import { UserFormOptionsUseCase } from '../domain/usecase/user-form-options.usecase';

@Component({
  selector: 'app-user-detail',
  imports: [FormsModule, PageHeaderComponent, TableSkeletonComponent, ButtonComponent],
  templateUrl: './user-detail.component.html',
})
export class UserDetailComponent implements OnInit {
  readonly usersLink = ROUTE_PATHS.users;
  readonly loading = signal(true);
  readonly user = signal<UserDetailEntity | null>(null);
  readonly editing = signal(false);
  readonly balanceLoading = signal(true);
  readonly balance = signal<UserBalanceEntity | null>(null);
  readonly balanceMissing = signal(false);
  readonly editingBalance = signal(false);
  readonly options = signal<UserFormOptions>({ roles: [], teams: [] });
  form: UserFormPayload = this.emptyForm();
  formError = '';
  balanceForm = this.emptyBalanceForm();
  balanceError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private getUserUseCase: GetUserUseCase,
    private getUserBalanceUseCase: GetUserBalanceUseCase,
    private saveUserUseCase: SaveUserUseCase,
    private saveUserBalanceUseCase: SaveUserBalanceUseCase,
    private formOptionsUseCase: UserFormOptionsUseCase,
  ) {}

  ngOnInit(): void {
    if (!this.auth.hasRole(ADMIN_ROLES)) {
      void this.router.navigateByUrl(ROUTE_PATHS.users);
      return;
    }
    const userId = Number(this.route.snapshot.paramMap.get('userId'));
    if (!Number.isInteger(userId) || userId <= 0) {
      void this.router.navigateByUrl(ROUTE_PATHS.users);
      return;
    }
    this.formOptionsUseCase.execute().subscribe({
      next: (options) => this.options.set(options),
      error: (err: Error) => toast.error(err.message),
    });
    this.getUserUseCase.execute(userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
    });
    this.getUserBalanceUseCase.execute(userId).subscribe({
      next: (balance) => {
        this.balance.set(balance);
        this.balanceLoading.set(false);
      },
      error: () => {
        this.balanceMissing.set(true);
        this.balanceLoading.set(false);
      },
    });
  }

  text(value?: string | null): string {
    const trimmed = value?.trim();
    return trimmed ? trimmed : '—';
  }

  accountType(value: number): string {
    return value === 1 ? 'External' : 'Internal';
  }

  onBoard(value: boolean): string {
    return value ? 'Yes' : 'No';
  }

  usedOf(used: number, max: number): string {
    return `${used}/${max}`;
  }

  startEdit(): void {
    const person = this.user();
    if (!person) {
      return;
    }
    this.form = {
      id: person.id,
      name: person.name,
      hrCode: person.hrCode,
      email: person.email ?? '',
      phone: person.phone ?? '',
      title: person.title ?? '',
      roleId: person.roleId,
      accountType: person.accountType,
      teamId: person.teamId ?? 0,
    };
    this.formError = '';
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.formError = '';
    this.editing.set(false);
  }

  save(): void {
    if (!this.form.name.trim() || !this.form.hrCode.trim()) {
      this.formError = 'Name and HR code are required';
      return;
    }
    this.saveUserUseCase.execute(this.form).subscribe({
      next: (user) => {
        this.user.set(user);
        this.editing.set(false);
        toast.success('User saved');
      },
      error: (err: Error) => {
        this.formError = err.message;
      },
    });
  }

  startBalanceEdit(): void {
    const figures = this.balance();
    const person = this.user();
    if (!figures || !person) {
      return;
    }
    this.balanceForm = { ...figures };
    this.balanceError = '';
    this.editingBalance.set(true);
  }

  cancelBalanceEdit(): void {
    this.balanceError = '';
    this.editingBalance.set(false);
  }

  saveBalance(): void {
    const person = this.user();
    const figures = this.balance();
    if (!person || !figures) {
      return;
    }
    const form = this.wholeNumbers(this.balanceForm);
    if (!form) {
      this.balanceError = 'Balance values must be zero or greater';
      return;
    }
    if (
      form.annualUsed > form.annualMax
      || form.emergencyUsed > form.emergencyMax
      || form.permissionUsed > form.permissionMax
      || form.wfhUsed > form.wfhMax
      || form.fromNextUsed > figures.fromNextMax
    ) {
      this.balanceError = 'Used balance cannot be above its maximum';
      return;
    }
    this.saveUserBalanceUseCase
      .execute({
        userId: person.id,
        annualUsed: form.annualUsed,
        annualMax: form.annualMax,
        sickUsed: form.sickUsed,
        emergencyUsed: form.emergencyUsed,
        emergencyMax: form.emergencyMax,
        permissionUsed: form.permissionUsed,
        permissionMax: form.permissionMax,
        wfhUsed: form.wfhUsed,
        wfhMax: form.wfhMax,
        fromNextUsed: form.fromNextUsed,
      })
      .subscribe({
        next: (balance) => {
          this.balance.set(balance);
          this.balanceMissing.set(false);
          this.editingBalance.set(false);
          toast.success('Balance saved');
        },
        error: (err: Error) => {
          this.balanceError = err.message;
        },
      });
  }

  private wholeNumbers(form: UserBalanceEntity): UserBalanceEntity | null {
    const values = [
      form.annualUsed,
      form.annualMax,
      form.sickUsed,
      form.emergencyUsed,
      form.emergencyMax,
      form.permissionUsed,
      form.permissionMax,
      form.wfhUsed,
      form.wfhMax,
      form.fromNextUsed,
    ].map((value) => Number(value));
    if (values.some((value) => !Number.isInteger(value) || value < 0)) {
      return null;
    }
    return {
      ...form,
      annualUsed: values[0],
      annualMax: values[1],
      sickUsed: values[2],
      emergencyUsed: values[3],
      emergencyMax: values[4],
      permissionUsed: values[5],
      permissionMax: values[6],
      wfhUsed: values[7],
      wfhMax: values[8],
      fromNextUsed: values[9],
    };
  }

  private emptyBalanceForm(): UserBalanceEntity {
    return {
      annualUsed: 0,
      annualMax: 0,
      sickUsed: 0,
      emergencyUsed: 0,
      emergencyMax: 0,
      permissionUsed: 0,
      permissionMax: 0,
      wfhUsed: 0,
      wfhMax: 0,
      fromNextUsed: 0,
      fromNextMax: 0,
    };
  }

  private emptyForm(): UserFormPayload {
    return {
      name: '',
      hrCode: '',
      email: '',
      phone: '',
      title: '',
      roleId: 0,
      accountType: 0,
      teamId: 0,
    };
  }
}
