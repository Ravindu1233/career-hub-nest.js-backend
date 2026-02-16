import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty({ message: 'Course name is required' })
  @IsString()
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;

  @IsNotEmpty({ message: 'Duration is required' })
  @IsString()
  @MaxLength(100, { message: 'Duration must not exceed 100 characters' })
  duration: string;

  @IsNotEmpty({ message: 'Start date is required' })
  @IsString()
  @MaxLength(100, { message: 'Start date must not exceed 100 characters' })
  startDate: string;

  @IsNotEmpty({ message: 'Price is required' })
  @IsString()
  @MaxLength(100, { message: 'Price must not exceed 100 characters' })
  price: string;

  @IsNotEmpty({ message: 'Course type is required' })
  @IsString()
  @MaxLength(100, { message: 'Type must not exceed 100 characters' })
  type: string;

  @IsOptional()
  @IsInt({ message: 'Spots must be an integer' })
  @Min(0, { message: 'Spots must be at least 0' })
  spots?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
