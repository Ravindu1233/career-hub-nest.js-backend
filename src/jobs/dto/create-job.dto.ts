import { IsString, MinLength } from 'class-validator';

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

  @IsString()
  @MinLength(5)
  requirements: string;
}
