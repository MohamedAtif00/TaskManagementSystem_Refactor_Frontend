import { CurriculumKind } from '../domain/entity/curriculum-admin.entity';

export const CHILD_KIND: Record<CurriculumKind, CurriculumKind | null> = {
  year: 'project',
  project: 'term',
  term: 'group',
  group: 'subject',
  subject: 'unit',
  unit: 'lesson',
  lesson: 'lo',
  lo: null,
};

export const KIND_LABEL: Record<CurriculumKind, string> = {
  year: 'Year',
  project: 'Project',
  term: 'Term',
  group: 'Subject group',
  subject: 'Subject',
  unit: 'Unit',
  lesson: 'Lesson',
  lo: 'Learning objective',
};

export const KIND_CHIP: Record<CurriculumKind, string> = {
  year: 'Year',
  project: 'Project',
  term: 'Term',
  group: 'Group',
  subject: 'Subject',
  unit: 'Unit',
  lesson: 'Lesson',
  lo: 'LO',
};

export const KIND_CHIP_CLASS: Record<CurriculumKind, string> = {
  year: 'bg-primary/15 text-primary',
  project: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  term: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  group: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300',
  subject: 'bg-green-500/15 text-green-800 dark:text-green-300',
  unit: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  lesson: 'bg-orange-500/15 text-orange-800 dark:text-orange-300',
  lo: 'bg-muted text-muted-foreground',
};

export const SUBJECT_STATUSES = [
  { id: 0, label: 'Active' },
  { id: 1, label: 'Closed' },
  { id: 2, label: 'Hold' },
  { id: 3, label: 'Reopened' },
];

export function labelOf(kind: string): string {
  return KIND_LABEL[kind as CurriculumKind] ?? kind;
}
