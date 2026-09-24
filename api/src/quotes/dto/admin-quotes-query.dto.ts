import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "../../common/pagination.js";
import { QuoteStatus } from "../../generated/prisma/client.js";

export class AdminQuotesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  /** Matches the reference, customer name or email. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
