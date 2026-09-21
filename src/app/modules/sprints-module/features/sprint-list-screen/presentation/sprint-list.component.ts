import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { environment } from '@environments/environment';
import { PermissionCodes } from '@core/models/permission-codes';
import { ADMIN_ROLES } from '@core/models/user-role';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import {
  SprintEntity,
  SprintFormPayload,
  SprintLoOption,
  SprintSubjectOption,
} from '../domain/entity/sprint-list.entity';
import { ArchiveSprintUseCase } from '../domain/usecase/archive-sprint.usecase';
import { SaveSprintUseCase } from '../domain/usecase/save-sprint.usecase';
import { SprintListUseCase } from '../domain/usecase/sprint-list.usecase';
import { SprintLosUseCase } from '../domain/usecase/sprint-los.usecase';
import { SprintSubjectsUseCase } from '../domain/usecase/sprint-subjects.usecase';

@Component({
  selector: 'app-sprint-list',
  imports: [FormsModule, PageHeaderComponent, ButtonComponent],
  templateUrl: './sprint-list.component.html',
})
export class SprintListComponent implements OnInit {
  archived = false;
  readonly rows = signal<SprintEntity[]>([]);
  readonly subjects = signal<SprintSubjectOption[]>([]);
  readonly availableLos = signal<SprintLoOption[]>([]);
  readonly showForm = signal(false);
  readonly confirmSprint = signal<SprintEntity | null>(null);
  readonly isAdmin: boolean;
  readonly canRestore = environment.useMock;

  formError = '';
  subjectId = 0;
  editingId: number | null = null;
  form: SprintFormPayload = this.emptyForm();
  selectedLos: SprintLoOption[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private listUseCase: SprintListUseCase,
    private saveUseCase: SaveSprintUseCase,
    private archiveUseCase: ArchiveSprintUseCase,
    private subjectsUseCase: SprintSubjectsUseCase,
    private losUseCase: SprintLosUseCase,
  ) {
    this.isAdmin = this.auth.hasRole(ADMIN_ROLES) || this.auth.hasPermission(PermissionCodes.Sprints.Manage);
  }

  ngOnInit(): void {
    this.load();
    this.subjectsUseCase.execute().subscribe((rows) => this.subjects.set(rows));
  }

  load(): void {
    this.listUseCase.execute({ archived: this.archived }).subscribe((rows) => this.rows.set(rows));
  }

  setTab(archived: boolean): void {
    this.archived = archived;
    this.load();
  }

  openBoard(row: SprintEntity, event?: Event): void {
    event?.stopPropagation();
    if (row.isArchived) {
      return;
    }
    void this.router.navigateByUrl(ROUTE_PATHS.sprintBoard(row.id));
  }

  openCreate(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.selectedLos = [];
    this.subjectId = 0;
    this.availableLos.set([]);
    this.formError = '';
    this.showForm.set(true);
  }

  openEdit(row: SprintEntity, event: Event): void {
    event.stopPropagation();
    this.editingId = row.id;
    this.form = {
      id: row.id,
      name: row.name,
      description: row.description,
      startDate: row.startDate,
      endDate: row.endDate,
      learningObjectIds: row.learningObjects.map((lo) => lo.id),
      previousLearningObjectIds: row.learningObjects.map((lo) => lo.id),
    };
    this.selectedLos = row.learningObjects.map((lo) => ({
      id: lo.id,
      name: lo.name,
      unitName: '',
      lessonName: '',
    }));
    this.subjectId = 0;
    this.availableLos.set([]);
    this.formError = '';
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  onSubjectChange(): void {
    if (!this.subjectId) {
      this.availableLos.set([]);
      return;
    }
    this.losUseCase.execute(this.subjectId).subscribe((rows) => this.availableLos.set(rows));
  }

  toggleLo(lo: SprintLoOption, checked: boolean): void {
    if (checked) {
      if (!this.selectedLos.some((item) => item.id === lo.id)) {
        this.selectedLos = [...this.selectedLos, lo];
      }
      return;
    }
    this.selectedLos = this.selectedLos.filter((item) => item.id !== lo.id);
  }

  isLoSelected(id: number): boolean {
    return this.selectedLos.some((item) => item.id === id);
  }

  save(): void {
    this.formError = '';
    if (!this.form.name.trim()) {
      this.formError = 'Sprint name is required';
      return;
    }
    if (this.form.endDate < this.form.startDate) {
      this.formError = 'End date must be after start date';
      return;
    }
    if (!this.selectedLos.length) {
      this.formError = 'Select at least one learning objective';
      return;
    }
    this.saveUseCase
      .execute({
        ...this.form,
        id: this.editingId ?? undefined,
        learningObjectIds: this.selectedLos.map((lo) => lo.id),
      })
      .subscribe({
        next: () => {
          toast.success(this.editingId ? 'Sprint updated' : 'Sprint created');
          this.showForm.set(false);
          this.load();
        },
        error: (err: Error) => toast.error(err.message),
      });
  }

  askArchive(row: SprintEntity, event: Event): void {
    event.stopPropagation();
    this.confirmSprint.set(row);
  }

  closeConfirm(): void {
    this.confirmSprint.set(null);
  }

  confirmArchive(): void {
    const row = this.confirmSprint();
    if (!row) {
      return;
    }
    this.archiveUseCase.execute({ id: row.id, archived: !row.isArchived }).subscribe({
      next: () => {
        toast.success(row.isArchived ? 'Sprint restored' : 'Sprint archived');
        this.confirmSprint.set(null);
        this.load();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  private emptyForm(): SprintFormPayload {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    return {
      name: '',
      description: '',
      startDate: this.toInputDate(start),
      endDate: this.toInputDate(end),
      learningObjectIds: [],
    };
  }

  private toInputDate(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
