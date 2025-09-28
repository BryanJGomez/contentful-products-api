import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  IsNull,
  Not,
  FindOptionsWhere,
  ILike,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
//
import { Products } from '../entities/product.entity';
import { CategoryReportResult } from '../../reports/interface/reports.interface';
import { IUpdateResult } from '../interface/producto.interface';
import { SearchQueryParamsDto } from '../dto/product.dto';
import { ReportsQueryParamsDto } from '../../reports/dto/reports.dto';
import { createDateRange } from '../../../utils/date';
@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Products)
    private readonly productsRepository: Repository<Products>,
  ) {}

  async findAll({
    limit,
    page,
    name,
    category,
    minPrice,
    maxPrice,
  }: SearchQueryParamsDto) {
    const skip = (Number(page) - 1) * Number(limit);
    // filter base (not deleted)
    const where: FindOptionsWhere<Products> = {
      isDeleted: false,
    };
    // Add filters based on provided parameters
    if (name) {
      where.name = ILike(`%${name}%`);
    }
    if (category) {
      where.category = category;
    }
    if (minPrice && maxPrice) {
      where.price = Between(minPrice, maxPrice);
    } else if (minPrice) {
      where.price = MoreThanOrEqual(minPrice);
    } else if (maxPrice) {
      where.price = LessThanOrEqual(maxPrice);
    }
    const [results, count] = await this.productsRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return { results, count };
  }

  async getDeletedProductsPercentage(): Promise<{ percentage: number }> {
    const [total, deleted] = await Promise.all([
      this.productsRepository.count(),
      this.productsRepository.count({
        where: {
          deletedAt: Not(IsNull()),
          isDeleted: true,
        },
        withDeleted: true,
      }),
    ]);
    const percentage =
      total > 0 ? parseFloat(((deleted / total) * 100).toFixed(2)) : 0;
    return { percentage };
  }

  async getNonDeletedProductsPercentage(
    filter: ReportsQueryParamsDto,
  ): Promise<{ percentage: number }> {
    // TypeORM automatically filters deleted items (deletedAt IS NULL)
    const totalNonDeleted = await this.productsRepository.count({
      where: {
        isDeleted: false,
        deletedAt: IsNull(),
      },
    });
    //  return if there are no non-deleted products
    if (totalNonDeleted === 0) return { percentage: 0 };
    // Build the where clause based on filters
    const where: FindOptionsWhere<Products> = {
      isDeleted: false,
      deletedAt: IsNull(),
    };
    // Add a filter for products that have a price or not
    if (filter.hasPrice === 'true') {
      where.price = Not(IsNull());
    } else if (filter.hasPrice === 'false') {
      where.price = IsNull();
    }
    // Add a date filter for products created with in a date range
    if (filter.startDate && filter.endDate) {
      const dateRange = createDateRange(filter.startDate, filter.endDate);
      where.createdAt = Between(dateRange.startDate, dateRange.endDate);
    }
    // Get the count of products that match the filters
    const filteredCount = await this.productsRepository.count({
      where,
      withDeleted: true,
    });
    // Calculate the final percentage
    const percentage = (filteredCount / totalNonDeleted) * 100;
    return { percentage };
  }

  async getProductsByCategoryReport(): Promise<CategoryReportResult[]> {
    return this.productsRepository
      .createQueryBuilder('product')
      .select('product.category', 'category')
      .addSelect('COUNT(product.id)', 'productCount')
      .addSelect('ROUND(AVG(product.price), 2)', 'averagePrice')
      .where('product.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('product.deletedAt IS NULL')
      .groupBy('product.category')
      .getRawMany();
  }

  async findOne(id: string): Promise<Partial<Products> | null> {
    return this.productsRepository.findOne({
      where: {
        id,
      },
      withDeleted: true,
    });
  }

  async productUpsert(product: Partial<Products>) {
    const result = await this.productsRepository.upsert(product, [
      'externalId',
    ]);
    return result;
  }
  async updateStatus(id: string): Promise<IUpdateResult> {
    const result = await this.productsRepository.update(id, {
      isDeleted: true,
    });
    return result;
  }
}
