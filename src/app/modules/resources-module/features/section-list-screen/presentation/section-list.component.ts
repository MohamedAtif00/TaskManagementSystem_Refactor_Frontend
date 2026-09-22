import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';
import { SectionEntity, SectionFormOptions, SectionFormPayload } from '../domain/entity/section-list.entity';
import { ArchiveSectionUseCase } from '../domain/usecase/archive-section.usecase';
import { SaveSectionUseCase } from '../domain/usecase/save-section.usecase';
import { SectionFormOptionsUseCase } from '../domain/usecase/section-form-options.usecase';
import { SectionListUseCase } from '../domain/usecase/section-list.usecase';

@Component({
  selector: 'app-section-list',
  imports: [FormsModule, PageHeaderComponent, ButtonComponent, TableSkeletonComponent],
  templateUrl: './section-list.component.html',
})
export class SectionListComponent implements OnInit {
  formError = '';
  readonly loading = signal(true);
  readonly rows = signal<SectionEntity[]>([]);
  readonly options = signal<SectionFormOptions>({ heads: [], teams: [] });
  readonly showForm = signal(false);
  readonly confirmSection = signal<SectionEntity | null>(null);
  form: SectionFormPayload = this.emptyForm();

  constructor(
    private listUseCase: SectionListUseCase,
    private saveUseCase: SaveSectionUseCase,
    private archiveUseCase: ArchiveSectionUseCase,
    private optionsUseCase: SectionFormOptionsUseCase,
  ) {}

  ngOnInit(): void {
    this.load();
    this.optionsUseCase.execute().subscribe((options) => this.options.set(options));
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

  openEdit(row: SectionEntity, event: Event): void {
    event.stopPropagation();
    this.form = {
      id: row.id,
      name: row.name,
      headId: row.headId,
      teamIds: row.teams.map((team) => team.id),
    };
    this.formError = '';
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  isTeamSelected(id: number): boolean {
    return this.form.teamIds.includes(id);
  }

  toggleTeam(id: number, checked: boolean): void {
    this.form.teamIds = checked ? [...this.form.teamIds, id] : this.form.teamIds.filter((item) => item !== id);
  }

  save(): void {
    if (!this.form.name.trim() || !this.form.headId) {
      this.formError = 'Name and head are required';
      return;
    }
    this.saveUseCase.execute(this.form).subscribe({
      next: () => {
        toast.success(this.form.id ? 'Section updated' : 'Section created');
        this.showForm.set(false);
        this.load();
      },
      error: (err: Error) => {
        this.formError = err.message;
        toast.error(err.message);
      },
    });
  }

  askArchive(row: SectionEntity, event: Event): void {
    event.stopPropagation();
    this.confirmSection.set(row);
  }

  closeConfirm(): void {
    this.confirmSection.set(null);
  }

  confirmArchive(): void {
    const row = this.confirmSection();
    if (!row) {
      return;
    }
    this.archiveUseCase.execute(row.id).subscribe({
      next: () => {
        toast.success('Section archived');
        this.confirmSection.set(null);
        this.load();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  teamNames(row: SectionEntity): string {
    return row.teams.map((team) => team.name).join(', ') || '—';
  }

  private emptyForm(): SectionFormPayload {
    return { name: '', headId: 0, teamIds: [] };
  }
}
