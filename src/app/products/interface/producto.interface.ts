import { PaginatedResult } from '../../../shared/dto/paginated-result.dto';

export interface IProduct {
  externalId: string;
  id: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  color: string;
  price: number;
  currency: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
}

export type IResultData<T = IProduct> = PaginatedResult<T>;
