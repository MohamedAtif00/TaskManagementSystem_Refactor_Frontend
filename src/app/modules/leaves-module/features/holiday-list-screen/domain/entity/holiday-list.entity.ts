export interface HolidayEntity {
  id: number;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
}

export interface HolidayFormPayload {
  id?: number;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
}
