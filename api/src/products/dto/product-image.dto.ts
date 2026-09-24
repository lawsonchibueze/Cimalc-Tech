import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class ProductImageDto {
  /** Storage key returned by the upload endpoint. Needed so the file can be cleaned up later. */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  key?: string;

  @IsString()
  @MaxLength(1000)
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  alt?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
