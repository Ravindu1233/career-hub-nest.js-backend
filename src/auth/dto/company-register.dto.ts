import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CompanyRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  phone?: string; // ✅ FIX (was mobile)

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  benefitsAndPerks?: string;

  @IsOptional()
  @IsString()
  profilePic?: string;
}
