import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsQueryParamsDto } from '../dto/reports.dto';
import { CategoryReportResult } from '../interface/reports.interface';
import { QueryParamsDto } from '../../../shared/dto/pagination.dto';
import {
  DeletedProductsReportResponse,
  NonDeletedProductsReportResponse,
} from '../../reports/interface/reports.interface';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('deleted-percentage')
  @ApiOperation({ summary: 'Get deleted products percentage' })
  getDeletedProductsPercentage(
    @Query() filter: QueryParamsDto,
  ): Promise<DeletedProductsReportResponse> {
    return this.reportsService.getDeletedProductsPercentage(filter);
  }

  @Get('non-deleted-percentages')
  @ApiOperation({ summary: 'Get non-deleted products percentage with filters' })
  getNonDeletedProductsPercentages(
    @Query() filter: ReportsQueryParamsDto,
  ): Promise<NonDeletedProductsReportResponse> {
    return this.reportsService.getNonDeletedProductsPercentages(filter);
  }

  @Get('by-category')
  @ApiOperation({
    summary: 'Get products report by category (count and average price)',
  })
  getProductsByCategoryReport(): Promise<CategoryReportResult[]> {
    return this.reportsService.getProductsByCategoryReport();
  }
}
