import { IsEmail, Matches } from 'class-validator';

export class VerifyPasswordResetOtpDto {
  @IsEmail()
  email: string;

  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit code' })
  otp: string;
}
