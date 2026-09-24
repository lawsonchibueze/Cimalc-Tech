import { IsBoolean } from "class-validator";

export class MarkHandledDto {
  @IsBoolean()
  handled!: boolean;
}
