import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CompanyLoginDto } from './dto/company-login.dto';
import { CompanyRegisterDto } from './dto/company-register.dto';

@Controller('auth/company')
export class CompanyAuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: CompanyRegisterDto) {
    return this.auth.registerCompany(dto);
  }

  @Post('login')
  login(@Body() dto: CompanyLoginDto) {
    return this.auth.loginCompany(dto);
  }
}
