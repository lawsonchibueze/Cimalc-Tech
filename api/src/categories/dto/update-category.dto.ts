import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { SLUG_PATTERN } from "../../products/dto/create-product.dto.js";

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  /** Only changes the slug when provided. Renaming a category keeps its URL stable. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(SLUG_PATTERN, { message: "slug must use lowercase letters, numbers and single hyphens" })
  slug?: string;

  /** An empty string or null clears the description. */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;
}
