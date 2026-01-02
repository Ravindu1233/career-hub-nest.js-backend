import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CompanyRegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;

  @IsString() companyName: string;
  @IsOptional() @IsString() mobile?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() url?: string;
}
