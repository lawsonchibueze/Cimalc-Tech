import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";
import { PaginationQueryDto } from "../../common/pagination.js";

export class ContactQueryDto extends PaginationQueryDto {
  /** true returns handled messages, false returns open ones, omitted returns all. */
  @IsOptional()
  @Transform(({ value }) => (value === "true" ? true : value === "false" ? false : value))
  @IsBoolean()
  handled?: boolean;
}
