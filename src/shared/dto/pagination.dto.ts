import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryParamsDto {
  @ApiProperty({ required: false, default: 1, type: Number })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page? = 1;

  @ApiProperty({ required: false, default: 5, type: Number })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit? = 5;
}
//
export class PaginateDto {
  @ApiProperty()
  totalRecords: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  hasPreviousPage: boolean;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  previousPage: number;

  @ApiProperty()
  nextPage: number;

  @ApiProperty()
  hasEllipsisBefore: boolean;

  @ApiProperty()
  hasEllipsisAfter: boolean;

  @ApiProperty({ type: [Number] })
  pageLinks: number[];
}
