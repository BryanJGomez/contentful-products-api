import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ProductsRepository } from '../repositories/products.repository';
import { SearchQueryParamsDto } from '../dto/product.dto';
import { paginateResult } from '../../../shared/utils/pagination.util';
import { IResultData, IProduct } from '../interface/producto.interface';
import { createContextWinston } from '../../../utils/logger.util';
import { ContenfulService } from './contenful.service';
import { IUpdateResult } from '../interface/producto.interface';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly contenfulService: ContenfulService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async syncProducts() {
    const fetchProducts = await this.contenfulService.syncProductsFromApi();
    const upsertResults = await Promise.all(
      fetchProducts.map((product) =>
        this.productsRepository.productUpsert(product),
      ),
    );
    this.logger.log('Contentful products sync job completed', {
      context: createContextWinston(
        this.constructor.name,
        this.syncProducts.name,
      ),
      upsertedCount: upsertResults.length,
    });
    return upsertResults;
  }

  async findAll(filter: SearchQueryParamsDto): Promise<IResultData<IProduct>> {
    const context = createContextWinston(
      this.constructor.name,
      this.findAll.name,
    );
    this.logger.log('Fetching all products', { context, filter });
    const { results, count } = await this.productsRepository.findAll(filter);
    return paginateResult<IProduct>(count, results, filter.limit, filter.page);
  }

  async updateStatus(id: string): Promise<IUpdateResult> {
    const context = createContextWinston(
      this.constructor.name,
      this.updateStatus.name,
    );
    // find the product first
    this.logger.log('Updating product status', { context, id });
    const product = await this.productsRepository.findOne(id);
    if (!product) {
      this.logger.warn('Product not found', { context, id });
      throw new Error('Product not found');
    }
    // Check if the product is already deleted
    if (product.isDeleted) {
      this.logger.warn('Product is already deleted', { context, id });
      throw new Error('Product is already deleted');
    }
    //
    return await this.productsRepository.updateStatus(id);
  }
}
