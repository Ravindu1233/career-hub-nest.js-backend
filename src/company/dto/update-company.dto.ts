import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  industry?: string;

  // ✅ Text column in DB — allow long descriptions
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  companySize?: string;

  // ✅ Must be full ISO date "2020-01-01", not bare "2020"
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}(T.*)?$/, {
    message: 'founded must be a full date string like 2020-01-01',
  })
  founded?: string;

  // ✅ Text column in DB — allow many benefits
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  benefitsAndPerks?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  profilePic?: string;
}
