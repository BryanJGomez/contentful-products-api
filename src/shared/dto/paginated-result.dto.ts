export type Ellipsis = '...';
export type PageLink = number | Ellipsis;

export interface PaginationMeta {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  previousPage: number | null;
  nextPage: number | null;
  hasEllipsisBefore: boolean;
  hasEllipsisAfter: boolean;
  pageLinks: PageLink[];
}

export interface PaginatedResult<T> extends PaginationMeta {
  results: T[];
}
