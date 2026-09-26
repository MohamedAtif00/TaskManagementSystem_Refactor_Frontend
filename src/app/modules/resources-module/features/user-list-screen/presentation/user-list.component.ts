import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { PagerComponent } from '@shared/component/pager/pager.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';
import {
  UserFormOptions,
  UserFormPayload,
  UserListItemEntity,
  USER_LIST_PAGE_SIZE,
} from '../domain/entity/user-list.entity';
import { ArchiveUserUseCase } from '../domain/usecase/archive-user.usecase';
import { GetUserUseCase } from '../domain/usecase/get-user.usecase';
import { SaveUserUseCase } from '../domain/usecase/save-user.usecase';
import { UserFormOptionsUseCase } from '../domain/usecase/user-form-options.usecase';
import { UserListUseCase } from '../domain/usecase/user-list.usecase';

@Component({
  selector: 'app-user-list',
  imports: [FormsModule, PageHeaderComponent, ButtonComponent, PagerComponent, TableSkeletonComponent],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit, OnDestroy {
  search = '';
  formError = '';
  readonly page = signal(1);
  readonly pageSize = USER_LIST_PAGE_SIZE;
  readonly totalCount = signal(0);
  readonly loading = signal(true);
  readonly rows = signal<UserListItemEntity[]>([]);
  readonly options = signal<UserFormOptions>({ roles: [], teams: [] });
  readonly showForm = signal(false);
  readonly confirmUser = signal<UserListItemEntity | null>(null);
  form: UserFormPayload = this.emptyForm();
  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private userListUseCase: UserListUseCase,
    private getUserUseCase: GetUserUseCase,
    private saveUserUseCase: SaveUserUseCase,
    private archiveUserUseCase: ArchiveUserUseCase,
    private formOptionsUseCase: UserFormOptionsUseCase,
  ) {}

  ngOnInit(): void {
    this.load();
    this.formOptionsUseCase.execute().subscribe((options) => this.options.set(options));
  }

  ngOnDestroy(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  }

  onSearchChange(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.page.set(1);
      this.load();
    }, 300);
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.userListUseCase.execute({ search: this.search, page: this.page(), pageSize: this.pageSize }).subscribe({
      next: (page) => {
        this.rows.set(page.items);
        this.totalCount.set(page.totalCount);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
    });
  }

  openCreate(): void {
    this.form = this.emptyForm();
    this.formError = '';
    this.showForm.set(true);
  }

  openEdit(row: UserListItemEntity, event: Event): void {
    event.stopPropagation();
    this.formError = '';
    this.getUserUseCase.execute(row.id).subscribe({
      next: (user) => {
        this.form = {
          id: user.id,
          name: user.name,
          hrCode: user.hrCode,
          email: user.email,
          phone: user.phone,
          title: user.title,
          roleId: user.roleId,
          accountType: user.accountType,
          teamId: user.teamId ?? 0,
        };
        this.showForm.set(true);
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  save(): void {
    if (!this.form.name.trim() || !this.form.hrCode.trim()) {
      this.formError = 'Name and HR code are required';
      return;
    }
    this.saveUserUseCase.execute(this.form).subscribe({
      next: () => {
        this.showForm.set(false);
        this.load();
        toast.success('User saved');
      },
      error: (err: Error) => {
        this.formError = err.message;
      },
    });
  }

  askArchive(row: UserListItemEntity, event: Event): void {
    event.stopPropagation();
    this.confirmUser.set(row);
  }

  closeConfirm(): void {
    this.confirmUser.set(null);
  }

  confirmArchive(): void {
    const row = this.confirmUser();
    if (!row) {
      return;
    }
    this.archiveUserUseCase.execute(row.id).subscribe({
      next: () => {
        this.confirmUser.set(null);
        this.load();
        toast.success('User archived');
      },
      error: (err: Error) => toast.error(err.message),
    });
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
