import {
  IsOptional,
  IsString,
  IsArray,
  IsInt,
  IsDateString,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() mobile?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  schools?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @IsOptional()
  @IsInt()
  olPassCount?: number;

  // ✅ ADD THIS
  @IsOptional()
  @IsDateString() // or @IsString() if you prefer
  dob?: string;
}
