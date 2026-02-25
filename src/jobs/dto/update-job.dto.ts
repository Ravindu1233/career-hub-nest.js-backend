import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

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
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  responsibilities?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  requiredSkills?: string[];

  @IsOptional()
  @IsString()
  @MinLength(5)
  requirements?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  // ← Max number of applicants allowed (optional)
  @IsOptional()
  @IsInt()
  @Min(1)
  maxApplicants?: number;
}
