import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/** One product line as priced by staff. */
export class QuoteResponseLineDto {
  @IsString()
  @MaxLength(100)
  id!: string;

  /** Whole naira price for a single unit. */
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  unitPrice!: number;

  /** Whether the product can be supplied at that price. */
  @IsBoolean()
  availability!: boolean;
}

export class RespondToQuoteDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => QuoteResponseLineDto)
  lines!: QuoteResponseLineDto[];

  /** Extra detail for the customer, for example lead time or warranty. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
