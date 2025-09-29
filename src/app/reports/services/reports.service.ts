import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ProductsRepository } from '../../products/repositories/products.repository';
import { createContextWinston } from '../../../utils/logger.util';
import {
  CategoryReportResult,
  NonDeletedProductsReportResponse,
  ReportExtras,
  ReportsDeletedProductsPercentage,
  DeletedProductsReportResponse,
} from '../interface/reports.interface';
import { ReportsQueryParamsDto } from '../dto/reports.dto';
import { paginateResult } from '../../../shared/utils/pagination.util';
import { IProduct } from '../../products/interface/producto.interface';
import { QueryParamsDto } from '../../../shared/dto/pagination.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getDeletedProductsPercentage(
    filter: QueryParamsDto,
  ): Promise<DeletedProductsReportResponse<IProduct>> {
    const context = createContextWinston(
      this.constructor.name,
      this.getDeletedProductsPercentage.name,
    );
    //
    this.logger.log('Generate reports', { context });
    const { results, count, total } =
      await this.productsRepository.getDeletedProductsPercentage(filter);
    //
    const reportExtras: ReportsDeletedProductsPercentage = {
      totalProducts: total,
      deletedProducts: count,
      deletedPercentage:
        total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : 0,
    };
    //
    return paginateResult<IProduct>(
      count,
      results,
      filter.limit,
      filter.page,
      5, // maxPageLinks
      reportExtras,
    );
  }

  async getNonDeletedProductsPercentages(
    filter: ReportsQueryParamsDto,
  ): Promise<NonDeletedProductsReportResponse<IProduct>> {
    const context = createContextWinston(
      this.constructor.name,
      this.getNonDeletedProductsPercentages.name,
    );
    this.logger.log('Generate reports with filters', { context, filter });
    //
    const { results, count, total } =
      await this.productsRepository.getNonDeletedProductsPercentage(filter);
    //
    const reportExtras: ReportExtras = {
      startDate: filter.startDate
        ? new Date(filter.startDate).toISOString()
        : null,
      endDate: filter.endDate ? new Date(filter.endDate).toISOString() : null,
      hasPrice: filter.hasPrice,
      totalProducts: total,
      deletedProducts: total - count,
      nonDeletedProducts: count,
      percentage:
        total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : 0,
    };
    //
    return paginateResult<IProduct>(
      count,
      results,
      filter.limit,
      filter.page,
      5, // maxPageLinks
      reportExtras,
    );
  }

  getProductsByCategoryReport(): Promise<CategoryReportResult[]> {
    const context = createContextWinston(
      this.constructor.name,
      this.getProductsByCategoryReport.name,
    );
    this.logger.log('Generate reports category product', { context });
    return this.productsRepository.getProductsByCategoryReport();
  }
}
