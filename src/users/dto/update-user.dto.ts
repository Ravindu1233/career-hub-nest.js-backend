import { IsOptional, IsString, IsArray, IsInt } from 'class-validator';

export class UpdateUserDto {
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

  // keep if you still use
  @IsOptional()
  @IsString()
  certification?: string;

  @IsOptional()
  @IsInt()
  olPassCount?: number;
}
