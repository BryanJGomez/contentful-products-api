import { Module } from '@nestjs/common';
//
import { ConfigurationService } from '../../config/services/configuration.service';
import { HttpModule } from '../../shared/http/http.module';

import { Products } from './entities/product.entity';
import { ProductsController } from './controller/products.controller';
import { ProductsService } from './services/products.service';
import { ContenfulService } from './services/contenful.service';
import { ProductsRepository } from './repositories/products.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ContenfulService,
    ConfigurationService,
    ProductsRepository,
  ],
  imports: [TypeOrmModule.forFeature([Products]), HttpModule],
  exports: [ProductsRepository], // Export ProductsRepository so other modules can use it
})
export class ProductsModule {}
