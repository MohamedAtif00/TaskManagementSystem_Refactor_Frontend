import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toast } from 'ngx-sonner';
import { CurriculumCatalogService } from '@core/network/curriculum-catalog.service';
import { LoCodeDisplayService } from '@core/lo-code/lo-code-display.service';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { SUBJECT_STATUS_LABELS } from '@core/models/role-map';
import { ButtonComponent } from '@shared/component/button/button.component';
import { LoCodeDisplayToggleComponent } from '@shared/component/lo-code-display-toggle/lo-code-display-toggle.component';
import { TreeSkeletonComponent } from '@shared/component/skeleton/tree-skeleton.component';
import { LoCodeLabelPipe } from '@shared/pipes/lo-code-label.pipe';
import { labelOf } from '../../curriculum-admin-screen/presentation/curriculum-admin.constants';
import { CurriculumNodeFormComponent } from '../../curriculum-admin-screen/presentation/curriculum-node-form.component';
import {
  CurriculumKind,
  CurriculumNode,
  SaveCurriculumPayload,
} from '../../curriculum-admin-screen/domain/entity/curriculum-admin.entity';
import { ArchiveCurriculumNodeUseCase } from '../../curriculum-admin-screen/domain/usecase/archive-curriculum-node.usecase';
import { CurriculumLookupsUseCase } from '../../curriculum-admin-screen/domain/usecase/curriculum-lookups.usecase';
import { GetSubjectUsersUseCase } from '../../curriculum-admin-screen/domain/usecase/get-subject-users.usecase';
import { SaveCurriculumNodeUseCase } from '../../curriculum-admin-screen/domain/usecase/save-curriculum-node.usecase';
import { SubjectFocusEntity } from '../domain/entity/subject-focus.entity';
import { GetSubjectFocusUseCase } from '../domain/usecase/get-subject-focus.usecase';

@Component({
  selector: 'app-subject-focus',
  imports: [
    RouterLink,
    ButtonComponent,
    LoCodeDisplayToggleComponent,
    TreeSkeletonComponent,
    LoCodeLabelPipe,
    CurriculumNodeFormComponent,
  ],
  templateUrl: './subject-focus.component.html',
})
export class SubjectFocusComponent implements OnInit {
  readonly loDisplay = inject(LoCodeDisplayService);
  readonly labelOf = labelOf;
  readonly curriculumPath = ROUTE_PATHS.curriculum;

  readonly loading = signal(true);
  readonly error = signal('');
  readonly subject = signal<SubjectFocusEntity | null>(null);
  readonly schemas = signal<{ id: number; name: string }[]>([]);
  readonly users = signal<{ id: number; name: string }[]>([]);
  readonly showForm = signal(false);
  readonly confirmNode = signal<CurriculumNode | null>(null);

  formError = '';
  form: SaveCurriculumPayload = this.emptyForm('unit');
  private subjectId = 0;

  constructor(
    private route: ActivatedRoute,
    private focusUseCase: GetSubjectFocusUseCase,
    private saveUseCase: SaveCurriculumNodeUseCase,
    private archiveUseCase: ArchiveCurriculumNodeUseCase,
    private lookupsUseCase: CurriculumLookupsUseCase,
    private subjectUsersUseCase: GetSubjectUsersUseCase,
    private catalog: CurriculumCatalogService,
  ) {}

  ngOnInit(): void {
    this.subjectId = Number(this.route.snapshot.paramMap.get('subjectId'));
    if (!this.subjectId) {
      this.error.set('Invalid subject');
      this.loading.set(false);
      return;
    }
    this.load();
    this.lookupsUseCase.execute().subscribe((lookups) => {
      this.schemas.set(lookups.schemas);
      this.users.set(lookups.users);
    });
  }

  statusLabel(status: number): string {
    return SUBJECT_STATUS_LABELS[status] ?? 'Active';
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.focusUseCase.execute(this.subjectId).subscribe({
      next: (data) => {
        this.subject.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message);
        toast.error(err.message);
      },
    });
  }

  openEditSubject(): void {
    const sub = this.subject();
    if (!sub) {
      return;
    }
    this.form = {
      id: sub.id,
      kind: 'subject',
      name: sub.name,
      description: sub.description,
      status: sub.status ?? 0,
    };
    this.formError = '';
    this.showForm.set(true);
    this.subjectUsersUseCase.execute(sub.id).subscribe((ids) => {
      this.form.userIds = ids;
    });
  }

  openAddUnit(): void {
    this.form = { ...this.emptyForm('unit'), parentId: this.subjectId };
    this.formError = '';
    this.showForm.set(true);
  }

  openAddLesson(unit: CurriculumNode): void {
    this.form = { ...this.emptyForm('lesson'), parentId: unit.id };
    this.formError = '';
    this.showForm.set(true);
  }

  openAddLo(lesson: CurriculumNode): void {
    this.form = {
      ...this.emptyForm('lo'),
      parentId: lesson.id,
      schemaId: this.schemas()[0]?.id,
    };
    this.formError = '';
    this.showForm.set(true);
  }

  openEdit(node: CurriculumNode): void {
    this.form = {
      id: node.id,
      kind: node.kind,
      name: node.name,
      description: node.description,
      status: node.status ?? 0,
      tag: node.tag,
      template: node.template,
      environment: node.environment,
      schemaId: node.schemaId,
    };
    this.formError = '';
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  onToggleUser(event: { userId: number; checked: boolean }): void {
    const current = this.form.userIds ?? [];
    this.form.userIds = event.checked
      ? [...current, event.userId]
      : current.filter((id) => id !== event.userId);
  }

  save(): void {
    if (!this.form.name.trim()) {
      this.formError = 'Name is required';
      return;
    }
    this.saveUseCase.execute(this.form).subscribe({
      next: () => {
        toast.success('Saved');
        this.showForm.set(false);
        this.catalog.clearCache();
        this.load();
      },
      error: (err: Error) => {
        this.formError = err.message;
        toast.error(err.message);
      },
    });
  }

  askArchive(node: CurriculumNode): void {
    this.confirmNode.set(node);
  }

  closeConfirm(): void {
    this.confirmNode.set(null);
  }

  confirmArchive(): void {
    const node = this.confirmNode();
    if (!node) {
      return;
    }
    this.archiveUseCase.execute({ kind: node.kind, id: node.id }).subscribe({
      next: () => {
        toast.success('Archived');
        this.confirmNode.set(null);
        this.catalog.clearCache();
        this.load();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  private emptyForm(kind: CurriculumKind): SaveCurriculumPayload {
    return {
      kind,
      name: '',
      description: '',
      status: 0,
      tag: '',
      template: '',
      environment: '',
    };
  }
}
