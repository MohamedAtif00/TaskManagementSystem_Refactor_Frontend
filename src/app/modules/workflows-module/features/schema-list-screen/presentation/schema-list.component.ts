import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { Observable, forkJoin, of } from 'rxjs';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import { TableSkeletonComponent } from '@shared/component/skeleton/table-skeleton.component';
import {
  NodeFormPayload,
  SchemaEntity,
  SchemaFormPayload,
  SchemaNode,
  SchemaStep,
  SchemaTaskBankOption,
  SchemaTypeOption,
  STEP_PRIORITY_LABELS,
  StepFormPayload,
} from '../domain/entity/schema-list.entity';
import { ArchiveNodeUseCase } from '../domain/usecase/archive-node.usecase';
import { ArchiveSchemaUseCase } from '../domain/usecase/archive-schema.usecase';
import { ArchiveStepUseCase } from '../domain/usecase/archive-step.usecase';
import { SaveNodeUseCase } from '../domain/usecase/save-node.usecase';
import { SaveSchemaUseCase } from '../domain/usecase/save-schema.usecase';
import { SaveStepUseCase } from '../domain/usecase/save-step.usecase';
import { SchemaGraphUseCase } from '../domain/usecase/schema-graph.usecase';
import { SchemaListUseCase } from '../domain/usecase/schema-list.usecase';
import { SchemaTaskBankUseCase } from '../domain/usecase/schema-task-bank.usecase';
import { ReorderNodesUseCase } from '../domain/usecase/reorder-nodes.usecase';
import { ReorderStepsUseCase } from '../domain/usecase/reorder-steps.usecase';
import { SchemaTypesUseCase } from '../domain/usecase/schema-types.usecase';

@Component({
  selector: 'app-schema-list',
  imports: [FormsModule, DragDropModule, NgTemplateOutlet, PageHeaderComponent, ButtonComponent, TableSkeletonComponent],
  templateUrl: './schema-list.component.html',
})
export class SchemaListComponent implements OnInit {
  readonly priorities = [
    { id: 0, label: 'None' },
    { id: 1, label: 'High' },
    { id: 2, label: 'Medium' },
    { id: 3, label: 'Low' },
  ];
  readonly loading = signal(true);
  readonly rows = signal<SchemaEntity[]>([]);
  readonly types = signal<SchemaTypeOption[]>([]);
  readonly bank = signal<SchemaTaskBankOption[]>([]);
  readonly nodes = signal<SchemaNode[]>([]);
  readonly designing = signal<SchemaEntity | null>(null);
  readonly showSchemaForm = signal(false);
  readonly showNodeForm = signal(false);
  readonly showStepForm = signal(false);
  readonly confirm = signal<{ kind: 'schema' | 'node' | 'step'; id: number; name: string } | null>(null);
  readonly parallelFor = signal<SchemaNode | null>(null);
  readonly reordering = signal(false);
  formError = '';
  schemaForm: SchemaFormPayload = this.emptySchema();
  nodeForm: NodeFormPayload = this.emptyNode(0);
  stepForm: StepFormPayload = this.emptyStep(0);

  constructor(
    private listUseCase: SchemaListUseCase,
    private saveSchemaUseCase: SaveSchemaUseCase,
    private archiveSchemaUseCase: ArchiveSchemaUseCase,
    private typesUseCase: SchemaTypesUseCase,
    private bankUseCase: SchemaTaskBankUseCase,
    private graphUseCase: SchemaGraphUseCase,
    private saveNodeUseCase: SaveNodeUseCase,
    private archiveNodeUseCase: ArchiveNodeUseCase,
    private saveStepUseCase: SaveStepUseCase,
    private archiveStepUseCase: ArchiveStepUseCase,
    private reorderNodesUseCase: ReorderNodesUseCase,
    private reorderStepsUseCase: ReorderStepsUseCase,
  ) {}

  ngOnInit(): void {
    this.load();
    this.typesUseCase.execute().subscribe((rows) => this.types.set(rows));
    this.bankUseCase.execute().subscribe((rows) => this.bank.set(rows));
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

  loadGraph(): void {
    const schema = this.designing();
    if (!schema) {
      return;
    }
    this.graphUseCase.execute(schema.id).subscribe({
      next: (rows) => this.nodes.set(rows),
      error: (err: Error) => toast.error(err.message),
    });
  }

  priorityLabel(priority: number): string {
    return STEP_PRIORITY_LABELS[priority] ?? String(priority);
  }

  onNodeDrop(event: CdkDragDrop<SchemaNode[]>): void {
    if (event.previousIndex === event.currentIndex || this.reordering()) {
      return;
    }
    this.moveBand(event.previousIndex, event.currentIndex - event.previousIndex);
  }

  moveNode(nodeId: number, delta: number): void {
    const bandIndex = this.middleBands().findIndex((band) => band.nodes.some((item) => item.node.id === nodeId));
    if (bandIndex < 0) {
      return;
    }
    this.moveBand(bandIndex, delta);
  }

  isFirstMovable(nodeId: number): boolean {
    return this.middleBands().findIndex((band) => band.nodes.some((item) => item.node.id === nodeId)) <= 0;
  }

  isLastMovable(nodeId: number): boolean {
    const bands = this.middleBands();
    const bandIndex = bands.findIndex((band) => band.nodes.some((item) => item.node.id === nodeId));
    return bandIndex < 0 || bandIndex === bands.length - 1;
  }

  onStepDrop(node: SchemaNode, event: CdkDragDrop<SchemaStep[]>): void {
    if (event.previousIndex === event.currentIndex || this.reordering()) {
      return;
    }
    const steps = [...node.steps];
    moveItemInArray(steps, event.previousIndex, event.currentIndex);
    this.persistStepOrder(node.id, steps);
  }

  moveStep(node: SchemaNode, index: number, delta: number): void {
    if (this.reordering()) {
      return;
    }
    const target = index + delta;
    if (target < 0 || target >= node.steps.length) {
      return;
    }
    const steps = [...node.steps];
    moveItemInArray(steps, index, target);
    this.persistStepOrder(node.id, steps);
  }

  private moveBand(bandIndex: number, delta: number): void {
    if (this.reordering() || delta === 0) {
      return;
    }
    const bands = this.middleBands();
    const target = bandIndex + delta;
    if (bandIndex < 0 || target < 0 || target >= bands.length) {
      return;
    }
    moveItemInArray(bands, bandIndex, target);
    this.snapAnchors(
      [
        ...this.anchorNodes('start'),
        ...bands.flatMap((band) => band.nodes.map((item) => item.node)),
        ...this.anchorNodes('end'),
      ],
      'Node order updated',
    );
  }

  private snapAnchors(packed: SchemaNode[], successMessage: string): void {
    const schema = this.designing();
    if (!schema) {
      return;
    }
    const currentIds = this.sortedNodes().map((node) => node.id);
    const packedIds = packed.map((node) => node.id);
    const orderChanged =
      currentIds.length !== packedIds.length || currentIds.some((id, index) => id !== packedIds[index]);
    const linkSaves = this.anchorLinkSaves(packed);
    if (!orderChanged && linkSaves.length === 0) {
      toast.success(successMessage);
      return;
    }
    this.nodes.set(this.withSequentialNodeOrders(this.withAnchorLinks(packed)));
    this.reordering.set(true);
    const saves$: Observable<unknown> = linkSaves.length > 0 ? forkJoin(linkSaves) : of(undefined);
    saves$.subscribe({
      next: () => {
        if (!orderChanged) {
          this.reordering.set(false);
          toast.success(successMessage);
          this.loadGraph();
          return;
        }
        this.reorderNodesUseCase.execute({ schemaId: schema.id, orderedNodeIds: packedIds }).subscribe({
          next: () => {
            this.reordering.set(false);
            toast.success(successMessage);
            this.loadGraph();
          },
          error: (err: Error) => {
            this.reordering.set(false);
            toast.error(err.message);
            this.loadGraph();
          },
        });
      },
      error: (err: Error) => {
        this.reordering.set(false);
        toast.error(err.message);
        this.loadGraph();
      },
    });
  }

  private anchorLinkSaves(packed: SchemaNode[]): Observable<void>[] {
    return this.withAnchorLinks(packed).flatMap((node) => {
      const current = this.nodes().find((item) => item.id === node.id);
      if (!current || this.sameIds(current.predecessorIds, node.predecessorIds)) {
        return [];
      }
      return [
        this.saveNodeUseCase.execute({
          id: node.id,
          schemaId: node.schemaId,
          name: node.name,
          isStart: node.isStart,
          isEnd: node.isEnd,
          predecessorIds: node.predecessorIds,
        }),
      ];
    });
  }

  private withAnchorLinks(packed: SchemaNode[]): SchemaNode[] {
    if (packed.length <= 1) {
      return packed;
    }
    const nonEnd = packed.filter((node) => this.anchorRole(node) !== 'end');
    const anchorId = nonEnd[nonEnd.length - 1]?.id;
    return packed.map((node) => {
      const role = this.anchorRole(node);
      if (role === 'start') {
        return { ...node, predecessorIds: [] };
      }
      if (role === 'end') {
        return { ...node, predecessorIds: anchorId && anchorId !== node.id ? [anchorId] : [] };
      }
      return node;
    });
  }

  private persistStepOrder(nodeId: number, steps: SchemaStep[]): void {
    const ordered = this.withSequentialStepOrders(steps);
    this.nodes.update((nodes) =>
      nodes.map((node) => (node.id === nodeId ? { ...node, steps: ordered } : node)),
    );
    this.reordering.set(true);
    this.reorderStepsUseCase.execute({ nodeId, orderedStepIds: ordered.map((step) => step.id) }).subscribe({
      next: () => {
        this.reordering.set(false);
        toast.success('Step order updated');
      },
      error: (err: Error) => {
        this.reordering.set(false);
        toast.error(err.message);
        this.loadGraph();
      },
    });
  }

  private withSequentialNodeOrders(nodes: SchemaNode[]): SchemaNode[] {
    return nodes.map((node, index) => ({ ...node, order: index + 1 }));
  }

  private withSequentialStepOrders(steps: SchemaStep[]): SchemaStep[] {
    return steps.map((step, index) => ({ ...step, order: index + 1 }));
  }

  openCreate(): void {
    this.schemaForm = this.emptySchema();
    this.formError = '';
    this.showSchemaForm.set(true);
  }

  openEdit(row: SchemaEntity, event: Event): void {
    event.stopPropagation();
    this.schemaForm = {
      id: row.id,
      name: row.name,
      description: row.description,
      typeId: row.typeId ?? null,
    };
    this.formError = '';
    this.showSchemaForm.set(true);
  }

  closeSchemaForm(): void {
    this.showSchemaForm.set(false);
  }

  saveSchema(): void {
    if (!this.schemaForm.name.trim()) {
      this.formError = 'Name is required';
      return;
    }
    this.saveSchemaUseCase.execute(this.schemaForm).subscribe({
      next: () => {
        toast.success(this.schemaForm.id != null ? 'Schema updated' : 'Schema created');
        this.showSchemaForm.set(false);
        this.load();
      },
      error: (err: Error) => {
        this.formError = err.message;
        toast.error(err.message);
      },
    });
  }

  openDesign(row: SchemaEntity, event: Event): void {
    event.stopPropagation();
    this.designing.set(row);
    this.nodes.set([]);
    this.bankUseCase.execute().subscribe((rows) => this.bank.set(rows));
    this.loadGraph();
  }

  closeDesign(): void {
    this.designing.set(null);
    this.nodes.set([]);
  }

  openAddNode(): void {
    const schema = this.designing();
    if (!schema) {
      return;
    }
    this.nodeForm = this.emptyNode(schema.id);
    this.formError = '';
    this.showNodeForm.set(true);
  }

  openEditNode(node: SchemaNode): void {
    this.nodeForm = {
      id: node.id,
      schemaId: node.schemaId,
      name: node.name,
      isStart: node.isStart,
      isEnd: node.isEnd,
      predecessorIds: [...node.predecessorIds],
    };
    this.formError = '';
    this.showNodeForm.set(true);
  }

  closeNodeForm(): void {
    this.showNodeForm.set(false);
  }

  saveNode(): void {
    if (!this.nodeForm.name.trim()) {
      this.formError = 'Name is required';
      return;
    }
    if (this.anchorFlagError()) {
      this.formError = this.anchorFlagError();
      return;
    }
    const schema = this.designing();
    this.saveNodeUseCase.execute(this.nodeForm).subscribe({
      next: () => {
        this.showNodeForm.set(false);
        if (!schema) {
          return;
        }
        this.graphUseCase.execute(schema.id).subscribe({
          next: (rows) => {
            this.nodes.set(rows);
            this.snapAnchors(this.packedNodes(), 'Node saved');
          },
          error: (err: Error) => toast.error(err.message),
        });
      },
      error: (err: Error) => {
        this.formError = err.message;
        toast.error(err.message);
      },
    });
  }

  anchorFlagError(): string {
    if (!this.nodeForm.isStart || !this.nodeForm.isEnd) {
      return '';
    }
    const others = this.nodes().filter((node) => node.id !== this.nodeForm.id);
    return others.length > 0 ? 'Choose Start or End when the schema has another node.' : '';
  }

  openAddStep(node: SchemaNode): void {
    if (!this.bank().length) {
      toast.error('Add a task bank item first');
      return;
    }
    this.stepForm = this.emptyStep(node.id);
    this.formError = '';
    this.showStepForm.set(true);
  }

  openEditStep(step: SchemaNode['steps'][number]): void {
    this.stepForm = {
      id: step.id,
      nodeId: step.nodeId,
      taskBankId: step.taskBankId,
      duration: step.duration,
      priority: step.priority,
    };
    this.formError = '';
    this.showStepForm.set(true);
  }

  closeStepForm(): void {
    this.showStepForm.set(false);
  }

  saveStep(): void {
    if (!this.stepForm.taskBankId) {
      this.formError = 'Task bank item is required';
      return;
    }
    this.saveStepUseCase.execute(this.stepForm).subscribe({
      next: () => {
        toast.success('Step saved');
        this.showStepForm.set(false);
        this.loadGraph();
      },
      error: (err: Error) => {
        this.formError = err.message;
        toast.error(err.message);
      },
    });
  }

  askArchive(kind: 'schema' | 'node' | 'step', id: number, name: string, event?: Event): void {
    event?.stopPropagation();
    this.confirm.set({ kind, id, name });
  }

  closeConfirm(): void {
    this.confirm.set(null);
  }

  confirmArchive(): void {
    const item = this.confirm();
    if (!item) {
      return;
    }
    const request$ =
      item.kind === 'schema'
        ? this.archiveSchemaUseCase.execute(item.id)
        : item.kind === 'node'
          ? this.archiveNodeUseCase.execute(item.id)
          : this.archiveStepUseCase.execute(item.id);
    request$.subscribe({
      next: () => {
        toast.success('Archived');
        this.confirm.set(null);
        if (item.kind === 'schema') {
          if (this.designing()?.id === item.id) {
            this.closeDesign();
          }
          this.load();
        } else {
          this.loadGraph();
        }
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  private emptySchema(): SchemaFormPayload {
    return { name: '', description: '', typeId: this.types()[0]?.id ?? null };
  }

  otherNodes(): SchemaNode[] {
    return this.nodes().filter((node) => node.id !== this.nodeForm.id);
  }

  isPredecessor(nodeId: number): boolean {
    return this.nodeForm.predecessorIds.includes(nodeId);
  }

  togglePredecessor(nodeId: number): void {
    const ids = this.nodeForm.predecessorIds;
    const index = ids.indexOf(nodeId);
    if (index >= 0) {
      ids.splice(index, 1);
    } else {
      ids.push(nodeId);
    }
  }

  predecessorNames(node: SchemaNode): string {
    const names = node.predecessorIds
      .map((id) => this.nodes().find((item) => item.id === id)?.name)
      .filter((name): name is string => !!name);
    return names.join(', ');
  }

  pinnedBands(role: 'start' | 'end'): { parallel: boolean; nodes: { node: SchemaNode; index: number }[] }[] {
    return this.bandNodes(this.anchorNodes(role));
  }

  middleBands(): { parallel: boolean; nodes: { node: SchemaNode; index: number }[] }[] {
    return this.bandNodes(this.middleNodes());
  }

  private anchorNodes(role: 'start' | 'end'): SchemaNode[] {
    return this.sortedNodes().filter((node) => this.anchorRole(node) === role);
  }

  private middleNodes(): SchemaNode[] {
    return this.sortedNodes().filter((node) => this.anchorRole(node) === 'middle');
  }

  private packedNodes(): SchemaNode[] {
    return [...this.anchorNodes('start'), ...this.middleNodes(), ...this.anchorNodes('end')];
  }

  private sortedNodes(): SchemaNode[] {
    return [...this.nodes()].sort((left, right) => left.order - right.order || left.id - right.id);
  }

  private anchorRole(node: SchemaNode): 'start' | 'end' | 'middle' {
    if (this.nodes().length <= 1) {
      return 'middle';
    }
    if (node.isEnd && !node.isStart) {
      return 'end';
    }
    if (node.isStart) {
      return 'start';
    }
    return 'middle';
  }

  private bandNodes(
    nodes: SchemaNode[],
  ): { parallel: boolean; nodes: { node: SchemaNode; index: number }[] }[] {
    const bands: { key: string | null; parallel: boolean; nodes: { node: SchemaNode; index: number }[] }[] = [];
    nodes.forEach((node, index) => {
      const key = this.isParallel(node) ? this.parallelKey(node) : null;
      const last = bands[bands.length - 1];
      if (key && last?.key === key) {
        last.nodes.push({ node, index });
        return;
      }
      bands.push({ key, parallel: !!key, nodes: [{ node, index }] });
    });
    return bands;
  }

  isParallel(node: SchemaNode): boolean {
    return this.parallelSiblings(node).length > 0;
  }

  parallelSiblingNames(node: SchemaNode): string {
    return this.parallelSiblings(node)
      .map((item) => item.name)
      .join(', ');
  }

  openParallel(node: SchemaNode): void {
    this.parallelFor.set(node);
  }

  closeParallel(): void {
    this.parallelFor.set(null);
  }

  parallelChoices(node: SchemaNode): SchemaNode[] {
    return this.nodes().filter((item) => item.id !== node.id && !item.isStart && !item.isEnd);
  }

  alreadyParallel(node: SchemaNode, other: SchemaNode): boolean {
    const key = this.parallelKey(node);
    return !!key && key === this.parallelKey(other);
  }

  makeParallel(node: SchemaNode, withNode: SchemaNode): void {
    if (
      this.reordering() ||
      this.alreadyParallel(node, withNode) ||
      node.isStart ||
      node.isEnd ||
      withNode.isStart ||
      withNode.isEnd
    ) {
      return;
    }
    const fromOther = withNode.predecessorIds.filter((id) => id !== node.id);
    const fromNode = node.predecessorIds.filter((id) => id !== withNode.id);
    let predecessorIds = fromOther.length ? fromOther : fromNode;
    let markStart = false;
    if (!predecessorIds.length) {
      const before = this.nodeBefore(node, withNode);
      if (before) {
        predecessorIds = [before.id];
      } else {
        markStart = true;
      }
    }
    const requests = [node, withNode]
      .filter((item, index) => index === 0 || !this.sameIds(item.predecessorIds, predecessorIds) || (markStart && !item.isStart))
      .map((item) =>
        this.saveNodeUseCase.execute({
          id: item.id,
          schemaId: item.schemaId,
          name: item.name,
          isStart: predecessorIds.length ? false : markStart || item.isStart,
          isEnd: item.isEnd,
          predecessorIds,
        }),
      );
    forkJoin(requests).subscribe({
      next: () => {
        this.parallelFor.set(null);
        this.persistPackedParallel(node, withNode, predecessorIds, markStart);
      },
      error: (err: Error) => toast.error(err.message),
    });
  }

  private persistPackedParallel(
    node: SchemaNode,
    withNode: SchemaNode,
    predecessorIds: number[],
    markStart: boolean,
  ): void {
    const packed = this.packParallel(node, withNode, predecessorIds, markStart);
    const packedIds = packed.map((item) => item.id);
    const currentIds = [...this.nodes()]
      .sort((a, b) => a.order - b.order || a.id - b.id)
      .map((item) => item.id);
    const alreadyPacked =
      currentIds.length === packedIds.length && currentIds.every((id, index) => id === packedIds[index]);
    const finish = () => {
      toast.success(`${node.name} and ${withNode.name} now run in parallel`);
      this.loadGraph();
    };
    if (alreadyPacked) {
      finish();
      return;
    }
    this.nodes.set(this.withSequentialNodeOrders(packed));
    this.reordering.set(true);
    this.reorderNodesUseCase.execute({ schemaId: node.schemaId, orderedNodeIds: packedIds }).subscribe({
      next: () => {
        this.reordering.set(false);
        finish();
      },
      error: (err: Error) => {
        this.reordering.set(false);
        toast.error(err.message);
        this.loadGraph();
      },
    });
  }

  private packParallel(
    node: SchemaNode,
    withNode: SchemaNode,
    predecessorIds: number[],
    markStart: boolean,
  ): SchemaNode[] {
    const key = predecessorIds.length
      ? [...predecessorIds].sort((a, b) => a - b).join(',')
      : markStart
        ? 'start'
        : null;
    const ordered = [...this.nodes()].sort((a, b) => a.order - b.order || a.id - b.id);
    const members = ordered.filter(
      (item) => item.id === node.id || item.id === withNode.id || (key !== null && this.parallelKey(item) === key),
    );
    const memberIds = new Set(members.map((item) => item.id));
    const earliestOrder = members[0]?.order ?? 0;
    const before = ordered.filter((item) => !memberIds.has(item.id) && item.order < earliestOrder);
    const after = ordered.filter((item) => !memberIds.has(item.id) && item.order >= earliestOrder);
    return [...before, ...members, ...after];
  }

  private parallelSiblings(node: SchemaNode): SchemaNode[] {
    const key = this.parallelKey(node);
    if (!key) {
      return [];
    }
    return this.nodes().filter((other) => other.id !== node.id && this.parallelKey(other) === key);
  }

  private parallelKey(node: SchemaNode): string | null {
    if (node.predecessorIds.length) {
      return [...node.predecessorIds].sort((a, b) => a - b).join(',');
    }
    return node.isStart ? 'start' : null;
  }

  private nodeBefore(left: SchemaNode, right: SchemaNode): SchemaNode | undefined {
    const earlier = Math.min(left.order, right.order);
    return this.nodes()
      .filter((item) => item.id !== left.id && item.id !== right.id && item.order < earlier)
      .sort((a, b) => b.order - a.order)[0];
  }

  private sameIds(left: number[], right: number[]): boolean {
    if (left.length !== right.length) {
      return false;
    }
    const sortedRight = [...right].sort((a, b) => a - b);
    return [...left].sort((a, b) => a - b).every((id, index) => id === sortedRight[index]);
  }

  private emptyNode(schemaId: number): NodeFormPayload {
    return { schemaId, name: '', isStart: false, isEnd: false, predecessorIds: [] };
  }

  private emptyStep(nodeId: number): StepFormPayload {
    return {
      nodeId,
      taskBankId: this.bank()[0]?.id ?? 0,
      duration: 30,
      priority: 2,
    };
  }
}
