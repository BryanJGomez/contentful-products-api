import { Controller, Get, Body, Query } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ApiTags } from '@nestjs/swagger';
import { SearchQueryParamsDto } from '../dto/product.dto';
import { IResultData, IProduct } from '../interface/producto.interface';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query() filter: SearchQueryParamsDto,
  ): Promise<IResultData<IProduct>> {
    return this.productsService.findAll(filter);
  }
}
