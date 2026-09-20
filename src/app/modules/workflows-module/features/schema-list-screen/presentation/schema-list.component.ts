import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toast } from 'ngx-sonner';
import { ButtonComponent } from '@shared/component/button/button.component';
import { PageHeaderComponent } from '@shared/component/page-header/page-header.component';
import {
  NodeFormPayload,
  SchemaEntity,
  SchemaFormPayload,
  SchemaNode,
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
import { SchemaTypesUseCase } from '../domain/usecase/schema-types.usecase';

@Component({
  selector: 'app-schema-list',
  imports: [FormsModule, PageHeaderComponent, ButtonComponent],
  templateUrl: './schema-list.component.html',
})
export class SchemaListComponent implements OnInit {
  readonly priorities = [
    { id: 0, label: 'None' },
    { id: 1, label: 'High' },
    { id: 2, label: 'Medium' },
    { id: 3, label: 'Low' },
  ];
  readonly rows = signal<SchemaEntity[]>([]);
  readonly types = signal<SchemaTypeOption[]>([]);
  readonly bank = signal<SchemaTaskBankOption[]>([]);
  readonly nodes = signal<SchemaNode[]>([]);
  readonly designing = signal<SchemaEntity | null>(null);
  readonly showSchemaForm = signal(false);
  readonly showNodeForm = signal(false);
  readonly showStepForm = signal(false);
  readonly confirm = signal<{ kind: 'schema' | 'node' | 'step'; id: number; name: string } | null>(null);
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
  ) {}

  ngOnInit(): void {
    this.load();
    this.typesUseCase.execute().subscribe((rows) => this.types.set(rows));
    this.bankUseCase.execute().subscribe((rows) => this.bank.set(rows));
  }

  load(): void {
    this.listUseCase.execute().subscribe({
      next: (rows) => this.rows.set(rows),
      error: (err: Error) => toast.error(err.message),
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
    this.saveNodeUseCase.execute(this.nodeForm).subscribe({
      next: () => {
        toast.success('Node saved');
        this.showNodeForm.set(false);
        this.loadGraph();
      },
      error: (err: Error) => {
        this.formError = err.message;
        toast.error(err.message);
      },
    });
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

  private emptyNode(schemaId: number): NodeFormPayload {
    return { schemaId, name: '', isStart: false, isEnd: false };
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
