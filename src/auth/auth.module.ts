import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

import { UserAuthController } from './auth.controller.user';
import { CompanyAuthController } from './auth.controller.company';
import { AdminAuthController } from './auth.controller.admin';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>('JWT_SECRET') ?? 'CHANGE_ME';
        const expiresIn = (config.get<string>('JWT_EXPIRES') ?? '7d') as any;
        return { secret, signOptions: { expiresIn } };
      },
    }),
  ],
  controllers: [UserAuthController, CompanyAuthController, AdminAuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
