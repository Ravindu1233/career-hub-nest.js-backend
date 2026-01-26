import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
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

  // ✅ MULTI responsibilities
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  responsibilities?: string[];

  // ✅ MULTI skills
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  requiredSkills?: string[];

  @IsOptional()
  @IsString()
  @MinLength(5)
  requirements?: string;

  // ✅ Deadline
  @IsOptional()
  @IsDateString()
  deadline?: string;
}
