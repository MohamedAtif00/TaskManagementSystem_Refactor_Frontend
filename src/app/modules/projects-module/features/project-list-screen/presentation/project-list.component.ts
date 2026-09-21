import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { ProjectFormPayload, ProjectRootEntity } from '../domain/entity/project-list.entity';
import { ArchiveProjectUseCase } from '../domain/usecase/archive-project.usecase';
import { GetProjectUseCase } from '../domain/usecase/get-project.usecase';
import { ProjectFormOptionsUseCase } from '../domain/usecase/project-form-options.usecase';
import { ProjectListUseCase } from '../domain/usecase/project-list.usecase';
import { SaveProjectUseCase } from '../domain/usecase/save-project.usecase';

@Component({
  selector: 'app-project-list',
  imports: [FormsModule, PageHeaderComponent, ButtonComponent],
  templateUrl: './project-list.component.html',
})
export class ProjectListComponent implements OnInit {
  search = '';
  formError = '';
  readonly rows = signal<ProjectRootEntity[]>([]);
  readonly years = signal<{ id: number; name: string }[]>([]);
  readonly showForm = signal(false);
  readonly confirmProject = signal<ProjectRootEntity | null>(null);
  form: ProjectFormPayload = this.emptyForm();

  constructor(
    private projectListUseCase: ProjectListUseCase,
    private getProjectUseCase: GetProjectUseCase,
    private formOptionsUseCase: ProjectFormOptionsUseCase,
    private saveProjectUseCase: SaveProjectUseCase,
    private archiveProjectUseCase: ArchiveProjectUseCase,
  ) {}

  ngOnInit(): void {
    this.formOptionsUseCase.execute().subscribe({
      next: (options) => this.years.set(options.years),
      error: (err: Error) => toast.error(err.message),
    });
    this.load();
  }

  load(): void {
    this.projectListUseCase.execute({ search: this.search }).subscribe((rows) => this.rows.set(rows));
  }

  openCreate(): void {
    this.form = this.emptyForm();
    this.formError = '';
    this.showForm.set(true);
  }

  openEdit(row: ProjectRootEntity, event: Event): void {
    event.stopPropagation();
    this.formError = '';
    this.getProjectUseCase.execute(row.id).subscribe({
      next: (project) => {
        this.form = {
          id: project.id,
          yearId: project.yearId,
          name: project.name,
          description: project.description,
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
    if (!this.form.name.trim()) {
      this.formError = 'Name is required';
      return;
    }
    if (!this.form.id && !this.form.yearId) {
      this.formError = 'Year is required';
      return;
    }
    this.saveProjectUseCase.execute(this.form).subscribe({
      next: () => {
        toast.success(this.form.id ? 'Project updated' : 'Project created');
        this.showForm.set(false);
        this.load();
      },
      error: (err: Error) => {
        this.formError = err.message;
        toast.error(err.message);
      },
    });
  }

  askArchive(row: ProjectRootEntity, event: Event): void {
    event.stopPropagation();
    this.confirmProject.set(row);
  }

  closeConfirm(): void {
    this.confirmProject.set(null);
  }

  confirmArchive(): void {
    const row = this.confirmProject();
    if (!row) {
      return;
    }
    this.archiveProjectUseCase.execute(row.id).subscribe({
      next: () => {
        toast.success('Project archived');
        this.confirmProject.set(null);
        this.load();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  private emptyForm(): ProjectFormPayload {
    return { yearId: 0, name: '', description: '' };
  }
}
