import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class RegionSearchDto {
  @ApiProperty({
    example: 'Ho Chi Minh City',
    description: 'Region/City name to filter books by owner location',
  })
  @IsString()
  region: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number for pagination',
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: 'Number of items per page',
    default: 20,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;
}

export class AvailableRegionsDto {
  @ApiProperty({
    example: ['Ho Chi Minh City', 'Hanoi', 'Da Nang'],
    description: 'List of regions that have available books',
  })
  regions: string[];

  @ApiProperty({
    example: 3,
    description: 'Total number of regions',
  })
  total: number;
}