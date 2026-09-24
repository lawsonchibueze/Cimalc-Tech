import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "../upload.constants.js";

export class ConfirmUploadDto {
  @IsString()
  @MaxLength(300)
  key!: string;

  /** Ignored. The API always derives the public URL from the key. Accepted so older clients keep working. */
  @IsOptional()
  @IsString()
  publicUrl?: string;

  @IsIn(ALLOWED_IMAGE_TYPES)
  contentType!: string;

  @IsInt()
  @Min(1)
  @Max(MAX_UPLOAD_BYTES)
  size!: number;
}
