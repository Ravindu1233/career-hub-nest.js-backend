import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  jobType?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  location?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  salaryRange?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  jobDescription?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  requirements?: string;
}
