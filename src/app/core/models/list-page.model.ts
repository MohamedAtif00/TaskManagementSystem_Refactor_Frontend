export interface ListPageResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export const DEFAULT_PAGE_SIZE = 20;

export function emptyListPage<T>(): ListPageResponse<T> {
  return { items: [], page: 1, pageSize: DEFAULT_PAGE_SIZE, totalCount: 0 };
}
