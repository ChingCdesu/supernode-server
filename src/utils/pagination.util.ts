import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationOptions {
  @ApiPropertyOptional({ enum: Order, default: Order.DESC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.DESC;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100, { message: 'exceed max row count limit for single query' })
  @IsOptional()
  readonly limit?: number = 10;

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}

export interface PaginationMetaParameters {
  paginationOptions: PaginationOptions;
  itemCount: number;
}

export class PaginationMeta {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly limit: number;

  @ApiProperty()
  readonly itemCount: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({ paginationOptions, itemCount }: PaginationMetaParameters) {
    this.page = paginationOptions.page;
    this.limit = paginationOptions.limit;
    this.itemCount = itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.limit);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}

export class Pagination<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty({ type: () => PaginationMeta })
  readonly meta: PaginationMeta;

  constructor(data: T[], meta: PaginationMeta) {
    this.data = data;
    this.meta = meta;
  }
}
