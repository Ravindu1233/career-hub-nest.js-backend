import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpdateApplicationDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsString()
  @IsEnum(['PENDING', 'REJECTED', 'INTERVIEW_SCHEDULED', 'SHORTLISTED'], {
    message:
      'Status must be one of: PENDING, REJECTED, INTERVIEW_SCHEDULED, SHORTLISTED',
  })
  status: string; // ✅ Remove the ? to make it required
}
