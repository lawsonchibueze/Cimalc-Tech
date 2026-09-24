import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { SLUG_PATTERN } from "../../products/dto/create-product.dto.js";

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  /** Optional. Generated from the name when omitted. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(SLUG_PATTERN, { message: "slug must use lowercase letters, numbers and single hyphens" })
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
