import {
  IsOptional,
  IsString,
  IsArray,
  IsInt,
  IsDateString,
} from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional() @IsString() companyName?: string;

  @IsOptional() @IsString() phone?: string; // Changed from 'mobile' to 'phone'

  @IsOptional() @IsString() address?: string;

  @IsOptional() @IsString() industry?: string;

  @IsOptional() @IsString() description?: string;

  @IsOptional() @IsString() url?: string;

  @IsOptional() @IsString() location?: string;

  @IsOptional() @IsString() companySize?: string;

  @IsOptional() @IsDateString() founded?: string;

  @IsOptional() @IsString() benefitsAndPerks?: string;

  @IsOptional() @IsString() profilePic?: string;
}
