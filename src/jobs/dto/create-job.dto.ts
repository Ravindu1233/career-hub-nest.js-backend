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

export class CreateJobDto {
  @IsString()
  @MinLength(2)
  jobTitle: string;

  @IsString()
  @MinLength(2)
  jobType: string;

  @IsString()
  @MinLength(2)
  location: string;

  @IsString()
  @MinLength(2)
  salaryRange: string;

  @IsString()
  @MinLength(5)
  jobDescription: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  responsibilities: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  requiredSkills: string[];

  @IsString()
  @MinLength(5)
  requirements: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  // ← Max number of applicants allowed (optional)
  @IsOptional()
  @IsInt()
  @Min(1)
  maxApplicants?: number;
}
