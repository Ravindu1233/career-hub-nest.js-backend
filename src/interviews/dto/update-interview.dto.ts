import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateInterviewDto {
  @IsOptional()
  @IsDateString({}, { message: 'Invalid date format' })
  interviewDate?: string;

  @IsOptional()
  @IsEnum(['video', 'phone', 'in-person'], {
    message: 'Interview type must be one of: video, phone, in-person',
  })
  interviewType?: string;

  @IsOptional()
  @IsEnum(['SCHEDULED', 'COMPLETED', 'CANCELLED'], {
    message: 'Status must be one of: SCHEDULED, COMPLETED, CANCELLED',
  })
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Meeting link must not exceed 500 characters' })
  meetingLink?: string;
}
