import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  jobDescription?: string;

  @IsOptional()
  @IsString()
  qualification?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  workingHours?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  olPassRequired?: number;
}
