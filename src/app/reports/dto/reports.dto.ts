import { IsOptional, IsBooleanString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QueryParamsDto } from '../../../shared/dto/pagination.dto';

export class ReportsQueryParamsDto extends QueryParamsDto {
  @ApiProperty({
    description:
      'Filter for products with or without price. Use "true" or "false".',
    required: false,
    example: 'true',
  })
  @IsOptional()
  @IsBooleanString()
  hasPrice?: string;

  @ApiProperty({
    description: 'Start date for the creation date range.',
    required: false,
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for the creation date range.',
    required: false,
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
