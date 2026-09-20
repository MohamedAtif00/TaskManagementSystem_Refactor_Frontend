import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { TeamEntity, TeamFormPayload, TeamMember } from '../domain/entity/team-list.entity';
import { ArchiveTeamUseCase } from '../domain/usecase/archive-team.usecase';
import { GetTeamUseCase } from '../domain/usecase/get-team.usecase';
import { SaveTeamUseCase } from '../domain/usecase/save-team.usecase';
import { TeamListUseCase } from '../domain/usecase/team-list.usecase';

@Component({
  selector: 'app-team-list',
  imports: [FormsModule, PageHeaderComponent, ButtonComponent],
  templateUrl: './team-list.component.html',
})
export class TeamListComponent implements OnInit {
  formError = '';
  readonly rows = signal<TeamEntity[]>([]);
  readonly members = signal<TeamMember[]>([]);
  readonly showForm = signal(false);
  readonly confirmTeam = signal<TeamEntity | null>(null);
  form: TeamFormPayload = this.emptyForm();

  constructor(
    private listUseCase: TeamListUseCase,
    private getUseCase: GetTeamUseCase,
    private saveUseCase: SaveTeamUseCase,
    private archiveUseCase: ArchiveTeamUseCase,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.listUseCase.execute().subscribe((rows) => this.rows.set(rows));
  }

  openCreate(): void {
    this.form = this.emptyForm();
    this.members.set([]);
    this.formError = '';
    this.showForm.set(true);
  }

  openEdit(row: TeamEntity, event: Event): void {
    event.stopPropagation();
    this.formError = '';
    this.getUseCase.execute(row.id).subscribe({
      next: (team) => {
        this.form = { id: team.id, name: team.name };
        this.members.set(team.members);
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
    this.saveUseCase.execute(this.form).subscribe({
      next: () => {
        toast.success(this.form.id ? 'Team updated' : 'Team created');
        this.showForm.set(false);
        this.load();
      },
      error: (err: Error) => {
        this.formError = err.message;
        toast.error(err.message);
      },
    });
  }

  askArchive(row: TeamEntity, event: Event): void {
    event.stopPropagation();
    this.confirmTeam.set(row);
  }

  closeConfirm(): void {
    this.confirmTeam.set(null);
  }

  confirmArchive(): void {
    const row = this.confirmTeam();
    if (!row) {
      return;
    }
    this.archiveUseCase.execute(row.id).subscribe({
      next: () => {
        toast.success('Team archived');
        this.confirmTeam.set(null);
        this.load();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  private emptyForm(): TeamFormPayload {
    return { name: '' };
  }
}
