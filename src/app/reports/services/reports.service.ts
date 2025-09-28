import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ProductsRepository } from '../../products/repositories/products.repository';
import { createContextWinston } from '../../../utils/logger.util';
import { CategoryReportResult } from '../interface/reports.interface';
import { ReportsQueryParamsDto } from '../dto/reports.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  getDeletedProductsPercentage(): Promise<{ percentage: number }> {
    const context = createContextWinston(
      this.constructor.name,
      this.getDeletedProductsPercentage.name,
    );
    this.logger.log('Generate reports', { context });
    return this.productsRepository.getDeletedProductsPercentage();
  }

  getNonDeletedProductsPercentages(
    filter: ReportsQueryParamsDto,
  ): Promise<{ percentage: number }> {
    const context = createContextWinston(
      this.constructor.name,
      this.getNonDeletedProductsPercentages.name,
    );
    this.logger.log('Generate reports with filters', { context, filter });
    return this.productsRepository.getNonDeletedProductsPercentage(filter);
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
