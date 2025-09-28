import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ApiTags } from '@nestjs/swagger';
import { SearchQueryParamsDto } from '../dto/product.dto';
import { IResultData, IProduct } from '../interface/producto.interface';
import { IUpdateResult } from '../interface/producto.interface';
import { Public } from '../../../decorators/public.decorator';

@ApiTags('Products')
@Public() // Modulo publico(sin autenticacion)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query() filter: SearchQueryParamsDto,
  ): Promise<IResultData<IProduct>> {
    return this.productsService.findAll(filter);
  }

  @Patch('status/:id')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<IUpdateResult> {
    return await this.productsService.updateStatus(id);
  }
}
