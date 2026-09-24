import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class CreateContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;
}
