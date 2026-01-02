import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';

@Controller('auth/admin')
export class AdminAuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: AdminRegisterDto) {
    return this.auth.registerAdmin(dto);
  }

  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.auth.loginAdmin(dto);
  }
}
