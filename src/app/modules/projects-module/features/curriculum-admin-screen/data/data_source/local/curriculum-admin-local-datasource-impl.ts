import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  ArchiveCurriculumPayload,
  CurriculumKind,
  CurriculumNode,
  SaveCurriculumPayload,
} from '../../../domain/entity/curriculum-admin.entity';
import { CurriculumNodeModel, CurriculumSchemaModel, CurriculumUserModel } from '../../model/curriculum-admin.model';
import { CurriculumAdminLocalDataSource } from './curriculum-admin-local-datasource';

@Injectable()
export class CurriculumAdminLocalDataSourceImpl extends CurriculumAdminLocalDataSource {
  private nextId = 100;
  private schemas: CurriculumSchemaModel[] = [{ id: 1, name: 'Default schema' }];
  private users: CurriculumUserModel[] = [
    { id: 1, name: 'Omar Owner' },
    { id: 5, name: 'Mona Member' },
  ];
  private subjectUsers = new Map<number, number[]>([[11, [5]]]);
  private tree: CurriculumNodeModel[] = [
    {
      key: 'year-1',
      id: 1,
      kind: 'year',
      name: '2026',
      description: 'Current year',
      childrenLoaded: true,
      children: [
        {
          key: 'project-1',
          id: 1,
          kind: 'project',
          name: 'Primary 2026',
          childrenLoaded: true,
          children: [
            {
              key: 'term-1',
              id: 1,
              kind: 'term',
              name: 'Term 1',
              childrenLoaded: true,
              children: [
                {
                  key: 'group-1',
                  id: 1,
                  kind: 'group',
                  name: 'Math',
                  childrenLoaded: true,
                  children: [
                    {
                      key: 'subject-11',
                      id: 11,
                      kind: 'subject',
                      name: 'Algebra',
                      status: 0,
                      childrenLoaded: false,
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  getTree(): Observable<CurriculumNodeModel[]> {
    return of(this.clone(this.tree)).pipe(delay(80));
  }

  loadChildren(node: CurriculumNode): Observable<CurriculumNodeModel[]> {
    if (node.kind !== 'subject') {
      return of(node.children);
    }
    const found = this.find(this.tree, node.key);
    if (found && !found.childrenLoaded) {
      found.childrenLoaded = true;
      found.children = [
        {
          key: `unit-${this.nextId}`,
          id: this.nextId++,
          kind: 'unit',
          name: 'Unit 1',
          childrenLoaded: true,
          children: [
            {
              key: `lesson-${this.nextId}`,
              id: this.nextId,
              kind: 'lesson',
              name: 'Lesson 1',
              childrenLoaded: true,
              children: [
                {
                  key: `lo-${this.nextId + 1}`,
                  id: this.nextId + 1,
                  kind: 'lo',
                  name: 'Mth_5R_1A_01_04_02',
                  tag: 'MTH',
                  children: [],
                  childrenLoaded: true,
                },
              ],
            },
          ],
        },
      ];
      this.nextId += 2;
    }
    return of(found ? this.clone(found.children) : []).pipe(delay(80));
  }

  save(payload: SaveCurriculumPayload): Observable<void> {
    if (payload.id != null) {
      const node = this.findById(this.tree, payload.kind, payload.id);
      if (node) {
        node.name = payload.name;
        node.description = payload.description;
        node.status = payload.status;
        node.tag = payload.tag;
        node.template = payload.template;
        node.environment = payload.environment;
      }
    } else {
      const child: CurriculumNodeModel = {
        key: `${payload.kind}-${this.nextId}`,
        id: this.nextId++,
        kind: payload.kind,
        name: payload.name,
        description: payload.description,
        status: payload.status,
        tag: payload.tag,
        template: payload.template,
        environment: payload.environment,
        children: [],
        childrenLoaded: payload.kind !== 'subject',
      };
      if (payload.kind === 'year') {
        this.tree.push(child);
      } else if (payload.parentId != null) {
        const parentKind = this.parentKind(payload.kind);
        const parent = parentKind ? this.findById(this.tree, parentKind, payload.parentId) : undefined;
        parent?.children.push(child);
      }
    }
    if (payload.kind === 'subject' && payload.id != null && payload.userIds) {
      this.subjectUsers.set(payload.id, [...payload.userIds]);
    }
    return of(undefined).pipe(delay(80));
  }

  archive(payload: ArchiveCurriculumPayload): Observable<void> {
    this.remove(this.tree, payload.kind, payload.id);
    return of(undefined).pipe(delay(80));
  }

  listSchemas(): Observable<CurriculumSchemaModel[]> {
    return of([...this.schemas]).pipe(delay(40));
  }

  listUsers(): Observable<CurriculumUserModel[]> {
    return of([...this.users]).pipe(delay(40));
  }

  getSubjectUsers(subjectId: number): Observable<number[]> {
    return of([...(this.subjectUsers.get(subjectId) ?? [])]).pipe(delay(40));
  }

  private parentKind(kind: CurriculumKind): CurriculumKind | null {
    const map: Record<CurriculumKind, CurriculumKind | null> = {
      year: null,
      project: 'year',
      term: 'project',
      group: 'term',
      subject: 'group',
      unit: 'subject',
      lesson: 'unit',
      lo: 'lesson',
    };
    return map[kind];
  }

  private find(nodes: CurriculumNodeModel[], key: string): CurriculumNodeModel | undefined {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }
      const nested = this.find(node.children, key);
      if (nested) {
        return nested;
      }
    }
    return undefined;
  }

  private findById(nodes: CurriculumNodeModel[], kind: CurriculumKind, id: number): CurriculumNodeModel | undefined {
    for (const node of nodes) {
      if (node.kind === kind && node.id === id) {
        return node;
      }
      const nested = this.findById(node.children, kind, id);
      if (nested) {
        return nested;
      }
    }
    return undefined;
  }

  private remove(nodes: CurriculumNodeModel[], kind: CurriculumKind, id: number): boolean {
    const index = nodes.findIndex((node) => node.kind === kind && node.id === id);
    if (index >= 0) {
      nodes.splice(index, 1);
      return true;
    }
    return nodes.some((node) => this.remove(node.children, kind, id));
  }

  private clone(nodes: CurriculumNodeModel[]): CurriculumNodeModel[] {
    return nodes.map((node) => ({ ...node, children: this.clone(node.children) }));
  }
}
