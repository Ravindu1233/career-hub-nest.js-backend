import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
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

  // ✅ MULTI responsibilities
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  responsibilities: string[];

  // ✅ MULTI skills
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  requiredSkills: string[];

  // keep extra text field (optional)
  @IsString()
  @MinLength(5)
  requirements: string;

  // ✅ Deadline
  @IsOptional()
  @IsDateString()
  deadline?: string; // client sends ISO date string
}
