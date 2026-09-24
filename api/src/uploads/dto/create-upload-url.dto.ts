import { IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Max, Min } from "class-validator";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, UPLOAD_FOLDERS } from "../upload.constants.js";

export class CreateUploadUrlDto {
  @IsString()
  @MaxLength(255)
  fileName!: string;

  @IsString()
  @IsIn(ALLOWED_IMAGE_TYPES)
  contentType!: string;

  @IsOptional()
  @IsIn(UPLOAD_FOLDERS)
  folder?: (typeof UPLOAD_FOLDERS)[number];

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z0-9_-]+$/)
  @MaxLength(80)
  productId?: string;

  @IsInt()
  @Min(1)
  @Max(MAX_UPLOAD_BYTES)
  size!: number;
}
