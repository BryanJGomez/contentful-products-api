import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  IsNull,
  FindOptionsWhere,
  ILike,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
//
import { Products } from '../entities/product.entity';
import { SearchQueryParamsDto } from '../dto/product.dto';
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
      deletedAt: IsNull(),
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

  async productUpsert(product: Partial<Products>) {
    const result = await this.productsRepository.upsert(product, [
      'externalId',
    ]);
    return result;
  }
}
