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
  pageLinks: any[];
}

export interface PaginatedResult<T> extends PaginationMeta {
  results: T[];
}
