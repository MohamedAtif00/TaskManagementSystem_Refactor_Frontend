export interface MockHoliday {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export const MOCK_PUBLIC_HOLIDAYS: MockHoliday[] = [
  { id: 1, name: 'New Year', description: 'Public holiday', startDate: '2026-01-01', endDate: '2026-01-01' },
];
