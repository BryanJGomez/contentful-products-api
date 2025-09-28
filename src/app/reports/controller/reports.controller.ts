import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsQueryParamsDto } from '../dto/reports.dto';
import { CategoryReportResult } from '../interface/reports.interface';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('deleted-percentage')
  @ApiOperation({ summary: 'Get deleted products percentage' })
  getDeletedProductsPercentage(): Promise<{ percentage: number }> {
    return this.reportsService.getDeletedProductsPercentage();
  }

  @Get('non-deleted-percentages')
  @ApiOperation({ summary: 'Get non-deleted products percentage with filters' })
  getNonDeletedProductsPercentages(
    @Query() filter: ReportsQueryParamsDto,
  ): Promise<{ percentage: number }> {
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
