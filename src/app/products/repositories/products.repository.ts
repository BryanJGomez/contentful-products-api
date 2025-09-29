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
import { QueryParamsDto } from '../../../shared/dto/pagination.dto';
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
  }: SearchQueryParamsDto): Promise<{
    results: Products[];
    count: number;
  }> {
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

  async getDeletedProductsPercentage({ page, limit }: QueryParamsDto): Promise<{
    results: Products[];
    count: number;
    total: number;
  }> {
    const skip = (Number(page) - 1) * Number(limit);
    const [total, [results, count]] = await Promise.all([
      this.productsRepository.count(),
      this.productsRepository.findAndCount({
        where: {
          deletedAt: Not(IsNull()),
          isDeleted: true,
        },
        withDeleted: true,
        skip,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      }),
    ]);

    return { results, count, total };
  }

  async getNonDeletedProductsPercentage({
    page,
    limit,
    hasPrice,
    startDate,
    endDate,
  }: ReportsQueryParamsDto): Promise<{
    results: Products[];
    count: number;
    total: number;
  }> {
    const skip = (Number(page) - 1) * Number(limit);
    const where: FindOptionsWhere<Products> = {
      isDeleted: false,
      deletedAt: IsNull(),
    };
    if (hasPrice === 'true') {
      where.price = Not(IsNull());
    } else if (hasPrice === 'false') {
      where.price = IsNull();
    }
    if (startDate && endDate) {
      const dateRange = createDateRange(startDate, endDate);
      where.createdAt = Between(dateRange.startDate, dateRange.endDate);
    }

    const [totalNonDeleted, [results, count]] = await Promise.all([
      this.productsRepository.count({
        where: {
          isDeleted: false,
          deletedAt: IsNull(),
        },
      }),
      this.productsRepository.findAndCount({
        where,
        withDeleted: true,
        skip,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      }),
    ]);

    if (totalNonDeleted === 0) {
      return { results: [], count: 0, total: 0 };
    }
    return { results, count, total: totalNonDeleted };
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
      deletedAt: new Date(),
      isDeleted: true,
    });
    return result;
  }
}
