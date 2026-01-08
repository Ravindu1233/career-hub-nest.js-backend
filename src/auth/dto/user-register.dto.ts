import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
} from 'class-validator';

export class UserRegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;

  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() mobile?: string;
  @IsOptional() @IsString() address?: string;

  // ✅ NEW
  @IsOptional() @IsString() bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  schools?: string;

  // Updated certification to an array of strings
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[]; // Multiple certifications now
}
