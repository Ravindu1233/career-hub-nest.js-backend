import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateApplicationDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Cover letter must not exceed 2000 characters' })
  coverLetter?: string;
}
