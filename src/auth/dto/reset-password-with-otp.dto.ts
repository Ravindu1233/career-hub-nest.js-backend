import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordWithOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
