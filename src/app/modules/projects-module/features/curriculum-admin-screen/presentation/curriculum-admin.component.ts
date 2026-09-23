import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { formatLoCode } from '@core/lo-code/lo-code.formatter';
import { LoCodeDisplayService } from '@core/lo-code/lo-code-display.service';
import { ROUTE_PATHS } from '@core/navigation/route-paths.const';
import { SUBJECT_STATUS_LABELS } from '@core/models/role-map';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { LoCodeDisplayToggleComponent } from '@shared/component/lo-code-display-toggle/lo-code-display-toggle.component';
import { TreeSkeletonComponent } from '@shared/component/skeleton/tree-skeleton.component';
import { LoCodeLabelPipe } from '@shared/pipes/lo-code-label.pipe';
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
import {
  CHILD_KIND,
  KIND_CHIP,
  KIND_CHIP_CLASS,
  KIND_LABEL,
} from './curriculum-admin.constants';
import { CurriculumNodeFormComponent } from './curriculum-node-form.component';

@Component({
  selector: 'app-curriculum-admin',
  imports: [FormsModule, NgClass, NgTemplateOutlet, PageHeaderComponent, LoCodeDisplayToggleComponent, ButtonComponent, TreeSkeletonComponent, LoCodeLabelPipe, CurriculumNodeFormComponent],
  templateUrl: './curriculum-admin.component.html',
})
export class CurriculumAdminComponent implements OnInit {
  readonly loDisplay = inject(LoCodeDisplayService);
  readonly loading = signal(true);
  readonly nodes = signal<CurriculumNode[]>([]);
  readonly openKeys = signal<Set<string>>(new Set());
  readonly loadingKeys = signal<Set<string>>(new Set());
  readonly query = signal('');
  readonly schemas = signal<CurriculumSchemaOption[]>([]);
  readonly users = signal<CurriculumUserOption[]>([]);
  readonly showForm = signal(false);
  readonly confirmNode = signal<CurriculumNode | null>(null);
  readonly statusLabels = SUBJECT_STATUS_LABELS;
  formError = '';
  form: SaveCurriculumPayload = this.emptyForm('year');

  readonly visibleKeys = computed(() => this.collectVisibleKeys(this.nodes(), this.query().trim().toLowerCase()));
  readonly hasVisibleNodes = computed(() => this.visibleKeys().size > 0);

  constructor(
    private router: Router,
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
    this.loading.set(true);
    const open = this.openKeys();
    this.treeUseCase.execute().subscribe({
      next: (rows) => {
        this.nodes.set(rows);
        this.reopen(rows, open);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.loading.set(false);
        toast.error(err.message);
      },
    });
  }

  isOpen(key: string): boolean {
    return this.openKeys().has(key);
  }

  isLoading(key: string): boolean {
    return this.loadingKeys().has(key);
  }

  isVisible(key: string): boolean {
    return this.visibleKeys().has(key);
  }

  isQueryMatch(node: CurriculumNode): boolean {
    const query = this.query().trim().toLowerCase();
    return !!query && this.searchText(node).includes(query);
  }

  canExpand(node: CurriculumNode): boolean {
    return CHILD_KIND[node.kind] != null;
  }

  childKind(kind: CurriculumKind): CurriculumKind | null {
    return CHILD_KIND[kind];
  }

  labelOf(kind: string): string {
    return KIND_LABEL[kind as CurriculumKind] ?? kind;
  }

  chipOf(kind: CurriculumKind): string {
    return KIND_CHIP[kind];
  }

  chipClass(kind: CurriculumKind): string {
    return KIND_CHIP_CLASS[kind];
  }

  childCount(node: CurriculumNode): number | null {
    if (!this.canExpand(node)) {
      return null;
    }
    if (node.kind === 'subject' && !node.childrenLoaded) {
      return null;
    }
    return node.children.length;
  }

  expandLabel(node: CurriculumNode): string {
    return `${this.isOpen(node.key) ? 'Collapse' : 'Expand'} ${node.name}`;
  }

  onQueryChange(value: string): void {
    this.query.set(value);
    const needle = value.trim().toLowerCase();
    if (!needle) {
      return;
    }
    const next = new Set(this.openKeys());
    this.collectMatchAncestors(this.nodes(), needle, []).forEach((key) => next.add(key));
    this.openKeys.set(next);
  }

  expandAll(): void {
    const next = new Set(this.openKeys());
    this.collectExpandableKeys(this.nodes()).forEach((key) => next.add(key));
    this.openKeys.set(next);
  }

  collapseAll(): void {
    this.openKeys.set(new Set());
  }

  toggle(node: CurriculumNode, event?: Event): void {
    event?.stopPropagation();
    if (!this.canExpand(node)) {
      return;
    }
    const next = new Set(this.openKeys());
    if (next.has(node.key)) {
      next.delete(node.key);
      this.openKeys.set(next);
      return;
    }
    next.add(node.key);
    this.openKeys.set(next);
    this.ensureChildren(node);
  }

  onRowActivate(node: CurriculumNode, event: Event): void {
    if ((event.target as HTMLElement | null)?.closest('button')) {
      return;
    }
    if (this.canExpand(node)) {
      this.toggle(node);
      return;
    }
    this.openEdit(node, event);
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

  onToggleUser(event: { userId: number; checked: boolean }): void {
    const current = this.form.userIds ?? [];
    this.form.userIds = event.checked
      ? [...current, event.userId]
      : current.filter((item) => item !== event.userId);
  }

  openFocus(node: CurriculumNode, event: Event): void {
    event.stopPropagation();
    void this.router.navigateByUrl(ROUTE_PATHS.curriculumSubjectFocus(node.id));
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

  private ensureChildren(node: CurriculumNode): void {
    if (node.kind !== 'subject' || node.childrenLoaded || this.isLoading(node.key)) {
      return;
    }
    this.setLoading(node.key, true);
    this.childrenUseCase.execute(node).subscribe({
      next: (children) => {
        node.children = children;
        node.childrenLoaded = true;
        this.nodes.set([...this.nodes()]);
        this.setLoading(node.key, false);
        if (this.query().trim()) {
          this.onQueryChange(this.query());
        }
      },
      error: (err: Error) => {
        this.setLoading(node.key, false);
        toast.error(err.message);
      },
    });
  }

  private reopen(nodes: CurriculumNode[], open: Set<string>): void {
    for (const node of nodes) {
      if (!open.has(node.key)) {
        continue;
      }
      if (node.kind === 'subject' && !node.childrenLoaded) {
        this.ensureChildren(node);
      } else {
        this.reopen(node.children, open);
      }
    }
  }

  private collectVisibleKeys(nodes: CurriculumNode[], query: string): Set<string> {
    const visible = new Set<string>();
    const addBranch = (node: CurriculumNode): void => {
      visible.add(node.key);
      for (const child of node.children) {
        addBranch(child);
      }
    };
    const walk = (items: CurriculumNode[]): boolean => {
      let any = false;
      for (const node of items) {
        const selfMatch = !query || this.searchText(node).includes(query);
        if (selfMatch) {
          addBranch(node);
          any = true;
          continue;
        }
        if (walk(node.children)) {
          visible.add(node.key);
          any = true;
        }
      }
      return any;
    };
    walk(nodes);
    return visible;
  }

  private collectMatchAncestors(nodes: CurriculumNode[], query: string, ancestors: string[]): string[] {
    const keys: string[] = [];
    for (const node of nodes) {
      const path = [...ancestors, node.key];
      const childKeys = this.collectMatchAncestors(node.children, query, path);
      if (this.searchText(node).includes(query) || childKeys.length) {
        keys.push(...ancestors, ...childKeys);
      }
    }
    return keys;
  }

  private collectExpandableKeys(nodes: CurriculumNode[]): string[] {
    const keys: string[] = [];
    for (const node of nodes) {
      if (this.canExpand(node) && (node.children.length > 0 || node.childrenLoaded)) {
        keys.push(node.key);
      }
      keys.push(...this.collectExpandableKeys(node.children));
    }
    return keys;
  }

  private searchText(node: CurriculumNode): string {
    const parts = [node.name, this.chipOf(node.kind), node.description, node.tag];
    if (node.kind === 'lo') {
      parts.push(formatLoCode(node.name, 'en'), formatLoCode(node.name, 'ar'));
    }
    return parts.filter(Boolean).join(' ').toLowerCase();
  }

  private setLoading(key: string, value: boolean): void {
    const next = new Set(this.loadingKeys());
    if (value) {
      next.add(key);
    } else {
      next.delete(key);
    }
    this.loadingKeys.set(next);
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
