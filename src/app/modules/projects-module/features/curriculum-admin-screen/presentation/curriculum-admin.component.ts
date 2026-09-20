import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { SUBJECT_STATUS_LABELS } from '@core/models/role-map';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import {
  CurriculumKind,
  CurriculumNode,
  CurriculumSchemaOption,
  CurriculumUserOption,
  SaveCurriculumPayload,
} from '../domain/entity/curriculum-admin.entity';
import { ArchiveCurriculumNodeUseCase } from '../domain/usecase/archive-curriculum-node.usecase';
import { CurriculumLookupsUseCase } from '../domain/usecase/curriculum-lookups.usecase';
import { GetCurriculumTreeUseCase } from '../domain/usecase/get-curriculum-tree.usecase';
import { GetSubjectUsersUseCase } from '../domain/usecase/get-subject-users.usecase';
import { LoadCurriculumChildrenUseCase } from '../domain/usecase/load-curriculum-children.usecase';
import { SaveCurriculumNodeUseCase } from '../domain/usecase/save-curriculum-node.usecase';

const CHILD_KIND: Record<CurriculumKind, CurriculumKind | null> = {
  year: 'project',
  project: 'term',
  term: 'group',
  group: 'subject',
  subject: 'unit',
  unit: 'lesson',
  lesson: 'lo',
  lo: null,
};

const KIND_LABEL: Record<CurriculumKind, string> = {
  year: 'Year',
  project: 'Project',
  term: 'Term',
  group: 'Subject group',
  subject: 'Subject',
  unit: 'Unit',
  lesson: 'Lesson',
  lo: 'Learning objective',
};

@Component({
  selector: 'app-curriculum-admin',
  imports: [FormsModule, NgTemplateOutlet, PageHeaderComponent, ButtonComponent],
  templateUrl: './curriculum-admin.component.html',
})
export class CurriculumAdminComponent implements OnInit {
  readonly nodes = signal<CurriculumNode[]>([]);
  readonly openKeys = signal<Set<string>>(new Set());
  readonly schemas = signal<CurriculumSchemaOption[]>([]);
  readonly users = signal<CurriculumUserOption[]>([]);
  readonly showForm = signal(false);
  readonly confirmNode = signal<CurriculumNode | null>(null);
  readonly statusLabels = SUBJECT_STATUS_LABELS;
  readonly statuses = [
    { id: 0, label: 'Active' },
    { id: 1, label: 'Closed' },
    { id: 2, label: 'Hold' },
    { id: 3, label: 'Reopened' },
  ];
  formError = '';
  form: SaveCurriculumPayload = this.emptyForm('year');

  constructor(
    private treeUseCase: GetCurriculumTreeUseCase,
    private childrenUseCase: LoadCurriculumChildrenUseCase,
    private saveUseCase: SaveCurriculumNodeUseCase,
    private archiveUseCase: ArchiveCurriculumNodeUseCase,
    private lookupsUseCase: CurriculumLookupsUseCase,
    private subjectUsersUseCase: GetSubjectUsersUseCase,
  ) {}

  ngOnInit(): void {
    this.load();
    this.lookupsUseCase.execute().subscribe((lookups) => {
      this.schemas.set(lookups.schemas);
      this.users.set(lookups.users);
    });
  }

  load(): void {
    const open = this.openKeys();
    this.treeUseCase.execute().subscribe({
      next: (rows) => {
        this.nodes.set(rows);
        this.reopen(rows, open);
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  isOpen(key: string): boolean {
    return this.openKeys().has(key);
  }

  childKind(kind: CurriculumKind): CurriculumKind | null {
    return CHILD_KIND[kind];
  }

  labelOf(kind: string): string {
    return KIND_LABEL[kind as CurriculumKind] ?? kind;
  }

  toggle(node: CurriculumNode): void {
    const next = new Set(this.openKeys());
    if (next.has(node.key)) {
      next.delete(node.key);
      this.openKeys.set(next);
      return;
    }
    next.add(node.key);
    this.openKeys.set(next);
    if (node.kind === 'subject' && !node.childrenLoaded) {
      this.childrenUseCase.execute(node).subscribe({
        next: (children) => {
          node.children = children;
          node.childrenLoaded = true;
          this.nodes.set([...this.nodes()]);
        },
        error: (err: Error) => toast.error(err.message),
      });
    }
  }

  openCreateYear(): void {
    this.form = this.emptyForm('year');
    this.formError = '';
    this.showForm.set(true);
  }

  openAddChild(node: CurriculumNode, event: Event): void {
    event.stopPropagation();
    const kind = CHILD_KIND[node.kind];
    if (!kind) {
      return;
    }
    this.form = { ...this.emptyForm(kind), parentId: node.id, schemaId: this.schemas()[0]?.id };
    this.formError = '';
    this.showForm.set(true);
  }

  openEdit(node: CurriculumNode, event: Event): void {
    event.stopPropagation();
    this.form = {
      id: node.id,
      kind: node.kind,
      name: node.name,
      description: node.description,
      status: node.status ?? 0,
      startDate: node.startDate,
      endDate: node.endDate,
      tag: node.tag,
      template: node.template,
      environment: node.environment,
      schemaId: node.schemaId,
      userIds: node.kind === 'subject' ? undefined : [],
    };
    this.formError = '';
    this.showForm.set(true);
    if (node.kind === 'subject') {
      this.subjectUsersUseCase.execute(node.id).subscribe((ids) => {
        this.form.userIds = ids;
      });
    }
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  isUserSelected(id: number): boolean {
    return !!this.form.userIds?.includes(id);
  }

  toggleUser(id: number, checked: boolean): void {
    const current = this.form.userIds ?? [];
    this.form.userIds = checked ? [...current, id] : current.filter((item) => item !== id);
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
        this.load();
      },
      error: (err: Error) => {
        this.formError = err.message;
        toast.error(err.message);
      },
    });
  }

  askArchive(node: CurriculumNode, event: Event): void {
    event.stopPropagation();
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
        this.load();
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  private reopen(nodes: CurriculumNode[], open: Set<string>): void {
    for (const node of nodes) {
      if (!open.has(node.key)) {
        continue;
      }
      if (node.kind === 'subject' && !node.childrenLoaded) {
        this.childrenUseCase.execute(node).subscribe({
          next: (children) => {
            node.children = children;
            node.childrenLoaded = true;
            this.nodes.set([...this.nodes()]);
            this.reopen(children, open);
          },
          error: (err: Error) => toast.error(err.message),
        });
      } else {
        this.reopen(node.children, open);
      }
    }
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
