export interface CategoryReportResult {
  category: string;
  productCount: string;
  averagePrice: string;
}

export interface ReportExtras {
  startDate?: string | null;
  endDate?: string | null;
  hasPrice?: boolean | string;
  totalProducts?: number;
  deletedProducts?: number;
  nonDeletedProducts?: number;
  percentage?: number;
}

export interface ReportsDeletedProductsPercentage {
  totalProducts: number;
  deletedProducts: number;
  deletedPercentage: number;
}

export interface NonDeletedProductsReportResponse<T = any> {
  results: T[];
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
  startDate?: string | null;
  endDate?: string | null;
  totalProducts?: number;
  deletedProducts?: number;
  nonDeletedProducts?: number;
  percentage?: number;
}

export interface DeletedProductsReportResponse<T = any> {
  results: T[];
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
  totalProducts?: number;
  deletedProducts?: number;
  deletedPercentage?: number;
}
