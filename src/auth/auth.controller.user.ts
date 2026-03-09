import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { RequestPasswordResetOtpDto } from './dto/request-password-reset-otp.dto';
import { VerifyPasswordResetOtpDto } from './dto/verify-password-reset-otp.dto';
import { ResetPasswordWithOtpDto } from './dto/reset-password-with-otp.dto';

@Controller('auth/user')
export class UserAuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: UserRegisterDto) {
    return this.auth.registerUser(dto);
  }

  @Post('login')
  login(@Body() dto: UserLoginDto) {
    return this.auth.loginUser(dto);
  }

  @Post('send-otp')
  sendPasswordResetOtp(@Body() dto: RequestPasswordResetOtpDto) {
    return this.auth.sendUserPasswordResetOtp(dto);
  }

  @Post('verify-otp')
  verifyPasswordResetOtp(@Body() dto: VerifyPasswordResetOtpDto) {
    return this.auth.verifyUserPasswordResetOtp(dto);
  }

  @Post('reset-password')
  resetPasswordWithOtp(@Body() dto: ResetPasswordWithOtpDto) {
    return this.auth.resetUserPasswordWithVerifiedOtp(dto);
  }
}
