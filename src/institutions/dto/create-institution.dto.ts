import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateInstitutionDto {
  @IsNotEmpty({ message: 'Institution name is required' })
  @IsString()
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Logo must not exceed 255 characters' })
  logo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Location must not exceed 255 characters' })
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Website must not exceed 255 characters' })
  website?: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Phone must not exceed 255 characters' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Founded year must not exceed 50 characters' })
  founded?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Students must not exceed 50 characters' })
  students?: string;
}
