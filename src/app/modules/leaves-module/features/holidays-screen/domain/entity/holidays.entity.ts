import { DEFAULT_PAGE_SIZE, ListPageResponse } from '@core/models/list-page.model';

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

export interface HolidayListParams {
  page: number;
  pageSize: number;
}

export type HolidayListPage = ListPageResponse<HolidayEntity>;

export const HOLIDAY_PAGE_SIZE = DEFAULT_PAGE_SIZE;
