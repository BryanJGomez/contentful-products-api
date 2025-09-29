import { PaginatedResult } from '../../../shared/dto/paginated-result.dto';
import { IProduct } from '../../products/interface/producto.interface';

export interface CategoryReportResult {
  category: string;
  productCount: string;
  averagePrice: string;
}

export interface ReportsDeletedProductsPercentage {
  totalProducts: number;
  deletedProducts: number;
  deletedPercentage: number;
}

export type DeletedProductsReportResponse = PaginatedResult<IProduct> &
  ReportsDeletedProductsPercentage;

export interface DeletedProductsExtras {
  startDate?: string | null;
  endDate?: string | null;
  hasPrice?: boolean | string;
  totalProducts?: number;
  deletedProducts?: number;
  nonDeletedProducts?: number;
  percentage?: number;
}

export type NonDeletedProductsReportResponse = PaginatedResult<IProduct> &
  DeletedProductsExtras;
