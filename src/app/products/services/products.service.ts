import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ProductsRepository } from '../repositories/products.repository';
import { SearchQueryParamsDto } from '../dto/product.dto';
import { paginateResult } from '../../../shared/utils/pagination.util';
import { IResultData, IProduct } from '../interface/producto.interface';
import { createContextWinston } from '../../../utils/logger.util';
import { ContenfulService } from './contenful.service';
import { IUpdateResult } from '../interface/producto.interface';
import { AxiosError } from 'axios';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly contenfulService: ContenfulService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async syncProducts() {
    const context = createContextWinston(
      this.constructor.name,
      this.syncProducts.name,
    );
    try {
      this.logger.log('Starting Contentful products sync job', context);

      const fetchedProducts = await this.contenfulService.syncProductsFromApi();

      if (!fetchedProducts || fetchedProducts.length === 0) {
        this.logger.warn(
          'No products were fetched from Contentful. Skipping upsert.',
          context,
        );
        return [];
      }
      //
      const upsertResults = await Promise.all(
        fetchedProducts.map((product) =>
          this.productsRepository.productUpsert(product),
        ),
      );

      this.logger.log('Contentful products sync job completed', {
        ...context,
        upsertedCount: upsertResults.length,
      });

      return upsertResults;
    } catch (error) {
      this.handleCronError(error, context);
    }
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
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    // Check if the product is already deleted
    if (product.isDeleted) {
      this.logger.warn('Product is already deleted', { context, id });
      throw new ConflictException('Product is already deleted');
    }
    return await this.productsRepository.updateStatus(id);
  }

  // Special error handler for cron job
  private handleCronError(error: unknown, context: any) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message =
        (error.response?.data as { message?: string })?.message ||
        error.message;
      this.logger.error(
        `Axios Error during Contentful sync (Status: ${status}): ${message}`,
        {
          ...context,
          stack: error.stack,
        },
      );
    } else if (error instanceof Error) {
      this.logger.error(
        `An unexpected error occurred during Contentful sync: ${error.message}`,
        {
          ...context,
          stack: error.stack,
        },
      );
    } else {
      this.logger.error(
        `An unknown error occurred during Contentful sync: ${String(error)}`,
        context,
      );
    }
  }
}
