export type CurriculumStatusTab = 'active' | 'hold' | 'closed';

export const CURRICULUM_STATUS_TABS: { id: CurriculumStatusTab; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'hold', label: 'Hold' },
  { id: 'closed', label: 'Closed' },
];

export function subjectMatchesStatusTab(status: number | undefined, tab: CurriculumStatusTab): boolean {
  const s = status ?? 0;
  switch (tab) {
    case 'active':
      return s === 0 || s === 3;
    case 'hold':
      return s === 2;
    case 'closed':
      return s === 1;
  }
}
