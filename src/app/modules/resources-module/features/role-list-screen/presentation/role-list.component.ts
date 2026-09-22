import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { RoleCatalogService } from '@core/network/role-catalog.service';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';
import { RoleEntity, RoleFormPayload, RolePermissionOption } from '../domain/entity/role-list.entity';
import { DeleteRoleUseCase } from '../domain/usecase/delete-role.usecase';
import { RoleListUseCase } from '../domain/usecase/role-list.usecase';
import { RolePermissionsUseCase } from '../domain/usecase/role-permissions.usecase';
import { SaveRoleUseCase } from '../domain/usecase/save-role.usecase';

@Component({
  selector: 'app-role-list',
  imports: [FormsModule, PageHeaderComponent, ButtonComponent, TableSkeletonComponent],
  templateUrl: './role-list.component.html',
})
export class RoleListComponent implements OnInit {
  formError = '';
  readonly loading = signal(true);
  readonly rows = signal<RoleEntity[]>([]);
  readonly permissions = signal<RolePermissionOption[]>([]);
  readonly showForm = signal(false);
  readonly confirmRole = signal<RoleEntity | null>(null);
  form: RoleFormPayload = this.emptyForm();

  constructor(
    private listUseCase: RoleListUseCase,
    private permissionsUseCase: RolePermissionsUseCase,
    private saveUseCase: SaveRoleUseCase,
    private deleteUseCase: DeleteRoleUseCase,
    private catalog: RoleCatalogService,
  ) {}

  ngOnInit(): void {
    this.load();
    this.permissionsUseCase.execute().subscribe((rows) => this.permissions.set(rows));
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
    this.form = this.emptyForm();
    this.formError = '';
    this.showForm.set(true);
  }

  openEdit(row: RoleEntity, event: Event): void {
    event.stopPropagation();
    if (row.isSystem) {
      toast.error('System roles cannot be edited');
      return;
    }
    this.form = {
      id: row.id,
      name: row.name,
      description: row.description,
      permissionIds: this.catalog.permissionIdsFor(
        { id: row.id, name: row.name, isSystem: row.isSystem, permissionCodes: row.permissionCodes },
        this.permissions().map((item) => ({ ...item, isSystem: false })),
      ),
    };
    this.formError = '';
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  isPermissionSelected(id: number): boolean {
    return this.form.permissionIds.includes(id);
  }

  togglePermission(id: number, checked: boolean): void {
    this.form.permissionIds = checked
      ? [...this.form.permissionIds, id]
      : this.form.permissionIds.filter((item) => item !== id);
  }

  save(): void {
    if (!this.form.name.trim()) {
      this.formError = 'Name is required';
      return;
    }
    this.saveUseCase.execute(this.form).subscribe({
      next: () => {
        toast.success(this.form.id != null ? 'Role updated' : 'Role created');
        this.showForm.set(false);
        this.load();
      },
      error: (err: Error) => {
        this.formError = err.message;
        toast.error(err.message);
      },
    });
  }

  askDelete(row: RoleEntity, event: Event): void {
    event.stopPropagation();
    if (row.isSystem) {
      toast.error('System roles cannot be deleted');
      return;
    }
    this.confirmRole.set(row);
  }

  closeConfirm(): void {
    this.confirmRole.set(null);
  }

  confirmDelete(): void {
    const row = this.confirmRole();
    if (!row) {
      return;
    }
    this.deleteUseCase.execute(row.id).subscribe({
      next: () => {
        toast.success('Role deleted');
        this.confirmRole.set(null);
        this.load();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  private emptyForm(): RoleFormPayload {
    return { name: '', description: '', permissionIds: [] };
  }
}
