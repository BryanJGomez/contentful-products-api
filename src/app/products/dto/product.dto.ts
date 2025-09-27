import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { QueryParamsDto } from '../../../shared/dto/pagination.dto';

export class SearchQueryParamsDto extends QueryParamsDto {
  @ApiProperty({
    required: false,
    type: String,
    description: 'Filtra por nombre de producto (búsqueda parcial).',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    required: false,
    type: String,
    description: 'Filtra por categoría del producto.',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    required: false,
    type: Number,
    description: 'Precio mínimo para el rango de precios.',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @ApiProperty({
    required: false,
    type: Number,
    description: 'Precio máximo para el rango de precios.',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;
}
