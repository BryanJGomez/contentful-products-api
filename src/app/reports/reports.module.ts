import { Module } from '@nestjs/common';
import { ReportsService } from './services/reports.service';
import { ReportsController } from './controller/reports.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [ProductsModule],
})
export class ReportsModule {}
