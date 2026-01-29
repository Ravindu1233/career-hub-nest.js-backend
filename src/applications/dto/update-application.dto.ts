import { IsEnum, IsOptional } from 'class-validator';

export class UpdateApplicationDto {
  @IsOptional()
  @IsEnum(['APPLIED', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'], {
    message:
      'Status must be one of: APPLIED, REVIEWED, SHORTLISTED, REJECTED, ACCEPTED',
  })
  status?: string;
}
