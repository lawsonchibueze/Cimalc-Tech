import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "../../common/pagination.js";
import { ProductStatus } from "../../generated/prisma/client.js";

export const productSorts = ["createdAt_asc", "createdAt_desc", "name_asc", "name_desc"] as const;
export type ProductSort = (typeof productSorts)[number];

/** Plain shape the service works with, so callers can copy it without class instance pitfalls. */
export interface ProductListQuery {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  sort: ProductSort;
}

export class ProductsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MaxLength(100)
  search?: string;

  /** Category id or slug. */
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsIn(productSorts)
  sort: ProductSort = "createdAt_desc";
}

export class AdminProductsQueryDto extends ProductsQueryDto {
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @Transform(({ value }) => (value === "true" ? true : value === "false" ? false : value))
  @IsBoolean()
  featured?: boolean;
}
