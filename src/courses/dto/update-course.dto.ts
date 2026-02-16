import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Duration must not exceed 100 characters' })
  duration?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Start date must not exceed 100 characters' })
  startDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Price must not exceed 100 characters' })
  price?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Type must not exceed 100 characters' })
  type?: string;

  @IsOptional()
  @IsInt({ message: 'Spots must be an integer' })
  @Min(0, { message: 'Spots must be at least 0' })
  spots?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
