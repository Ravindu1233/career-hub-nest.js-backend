import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';

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
}
