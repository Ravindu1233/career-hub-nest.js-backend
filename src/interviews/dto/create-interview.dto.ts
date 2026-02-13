import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateInterviewDto {
  @IsNotEmpty({ message: 'Interview date and time is required' })
  @IsDateString({}, { message: 'Invalid date format' })
  interviewDate: string;

  @IsNotEmpty({ message: 'Interview type is required' })
  @IsEnum(['video', 'phone', 'in-person'], {
    message: 'Interview type must be one of: video, phone, in-person',
  })
  interviewType: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Meeting link must not exceed 500 characters' })
  meetingLink?: string;
}
