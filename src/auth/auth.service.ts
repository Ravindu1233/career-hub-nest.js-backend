import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { MailService } from '../mail/mail.service';

import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { CompanyLoginDto } from './dto/company-login.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { RequestPasswordResetOtpDto } from './dto/request-password-reset-otp.dto';
import { VerifyPasswordResetOtpDto } from './dto/verify-password-reset-otp.dto';
import { ResetPasswordWithOtpDto } from './dto/reset-password-with-otp.dto';
import { VerifyUserLoginOtpDto } from './dto/verify-user-login-otp.dto';
import { VerifyCompanyLoginOtpDto } from './dto/verify-company-login-otp.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private rounds: number;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {
    this.rounds = Number(this.config.get('BCRYPT_ROUNDS') ?? 10);
  }

  private signToken(payload: JwtPayload) {
    const secret = this.config.get<string>('JWT_SECRET') ?? 'CHANGE_ME';
    const expiresIn = (this.config.get<string>('JWT_EXPIRES') ?? '7d') as any;
    return this.jwt.sign(payload, { secret, expiresIn });
  }

  // ─── Helper: throw if account is not allowed to login ───────────────────────
  private checkAccountStatus(status: string, rejectionReason?: string | null) {
    if (status === 'REJECTED') {
      throw new ForbiddenException(
        `Your account has been rejected. Reason: ${rejectionReason ?? 'No reason provided'}`,
      );
    }
    if (status === 'SUSPENDED') {
      throw new ForbiddenException(
        `Your account has been suspended. ${rejectionReason ? 'Reason: ' + rejectionReason : ''}`.trim(),
      );
    }
    // PENDING → allowed to login but frontend will see status: 'PENDING'
    // APPROVED → fully allowed
  }

  // ─────────────────────────────────────────
  // USER
  // ─────────────────────────────────────────

  async loginAny(dto: LoginDto) {
    try {
      const userResult = await this.loginUser({
        email: dto.email,
        password: dto.password,
      });
      return { ...userResult, authType: 'USER' };
    } catch (error: any) {
      if (error?.status && error.status !== 401) {
        throw error;
      }
    }

    try {
      const companyResult = await this.loginCompany({
        email: dto.email,
        password: dto.password,
      });
      return { ...companyResult, authType: 'COMPANY' };
    } catch (error: any) {
      if (error?.status && error.status !== 401) {
        throw error;
      }
    }

    try {
      const adminResult = await this.loginAdmin({
        email: dto.email,
        password: dto.password,
      });
      return { ...adminResult, authType: 'ADMIN' };
    } catch (error: any) {
      if (error?.status && error.status !== 401) {
        throw error;
      }
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async registerUser(dto: UserRegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('User email already exists');

    const hash = await bcrypt.hash(dto.password, this.rounds);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        firstName: dto.firstName ?? null,
        lastName: dto.lastName ?? null,
        mobile: dto.mobile ?? null,
        address: dto.address ?? null,
        bio: dto.bio ?? null,
        skills: dto.skills ?? [],
        schools: dto.schools ?? null,
        certifications: dto.certifications ?? [],
        // status defaults to PENDING via Prisma schema
      },
      select: {
        userId: true,
        email: true,
        firstName: true,
        lastName: true,
        mobile: true,
        address: true,
        bio: true,
        skills: true,
        schools: true,
        certifications: true,
        status: true, //  return so frontend knows it's pending
      },
    });

    const token = this.signToken({ sub: user.userId, type: 'USER' });
    return {
      token,
      user,
      message:
        'Registration successful. Your account is pending admin approval.',
    };
  }

  async loginUser(dto: UserLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    //  Block REJECTED / SUSPENDED from getting a token
    this.checkAccountStatus(user.status, user.rejectionReason);

    if (user.twoFactorEnabled) {
      const otp = this.generateOtpCode();
      const otpHash = await bcrypt.hash(otp, this.rounds);
      const ttlMinutes = this.getLoginOtpTtlMinutes();
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

      await this.prisma.user.update({
        where: { userId: user.userId },
        data: {
          loginOtpHash: otpHash,
          loginOtpExpiresAt: expiresAt,
        },
      });

      await this.mailService.sendUserLoginOtp(user.email, otp, ttlMinutes);

      return {
        requiresTwoFactor: true,
        message: 'A login OTP has been sent to your email address.',
      };
    }

    const token = this.signToken({ sub: user.userId, type: 'USER' });
    return {
      token,
      requiresTwoFactor: false,
      user: {
        userId: user.userId,
        email: user.email,
        status: user.status, //  frontend can show "pending approval" banner
      },
    };
  }

  async verifyUserLoginOtp(dto: VerifyUserLoginOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        userId: true,
        email: true,
        status: true,
        rejectionReason: true,
        twoFactorEnabled: true,
        loginOtpHash: true,
        loginOtpExpiresAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid OTP or email');
    }

    this.checkAccountStatus(user.status, user.rejectionReason);

    if (!user.twoFactorEnabled) {
      throw new BadRequestException(
        'Two-factor authentication is disabled for this account',
      );
    }

    if (!user.loginOtpHash || !user.loginOtpExpiresAt) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (user.loginOtpExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP has expired');
    }

    const isValid = await bcrypt.compare(dto.otp, user.loginOtpHash);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: {
        loginOtpHash: null,
        loginOtpExpiresAt: null,
      },
    });

    const token = this.signToken({ sub: user.userId, type: 'USER' });
    return {
      token,
      requiresTwoFactor: false,
      user: {
        userId: user.userId,
        email: user.email,
        status: user.status,
      },
    };
  }

  private generateOtpCode() {
    return randomInt(100000, 1000000).toString();
  }

  private getPasswordResetOtpTtlMinutes() {
    return Number(this.config.get('PASSWORD_RESET_OTP_TTL_MINUTES') ?? 15);
  }

  private getLoginOtpTtlMinutes() {
    return Number(this.config.get('LOGIN_OTP_TTL_MINUTES') ?? 10);
  }

  async sendUserPasswordResetOtp(dto: RequestPasswordResetOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { userId: true, email: true },
    });

    if (!user) {
      return {
        message:
          'If an account with that email exists, a password reset OTP has been sent.',
      };
    }

    const otp = this.generateOtpCode();
    const otpHash = await bcrypt.hash(otp, this.rounds);
    const ttlMinutes = this.getPasswordResetOtpTtlMinutes();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: {
        passwordResetOtpHash: otpHash,
        passwordResetOtpExpiresAt: expiresAt,
        passwordResetOtpVerifiedAt: null,
      },
    });

    await this.mailService.sendUserPasswordResetOtp(user.email, otp, ttlMinutes);

    return {
      message:
        'If an account with that email exists, a password reset OTP has been sent.',
    };
  }

  async verifyUserPasswordResetOtp(dto: VerifyPasswordResetOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        userId: true,
        passwordResetOtpHash: true,
        passwordResetOtpExpiresAt: true,
      },
    });

    if (!user?.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (user.passwordResetOtpExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP has expired');
    }

    const isValid = await bcrypt.compare(dto.otp, user.passwordResetOtpHash);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: { passwordResetOtpVerifiedAt: new Date() },
    });

    return { message: 'OTP verified successfully' };
  }

  async resetUserPasswordWithVerifiedOtp(dto: ResetPasswordWithOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        userId: true,
        passwordResetOtpHash: true,
        passwordResetOtpExpiresAt: true,
        passwordResetOtpVerifiedAt: true,
      },
    });

    if (
      !user?.passwordResetOtpHash ||
      !user.passwordResetOtpExpiresAt ||
      !user.passwordResetOtpVerifiedAt
    ) {
      throw new BadRequestException('OTP verification is required');
    }

    if (user.passwordResetOtpExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP has expired');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, this.rounds);

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: {
        passwordHash: newPasswordHash,
        passwordResetOtpHash: null,
        passwordResetOtpExpiresAt: null,
        passwordResetOtpVerifiedAt: null,
      },
    });

    return { message: 'Password reset successful' };
  }

  // ─────────────────────────────────────────
  // COMPANY
  // ─────────────────────────────────────────

  async registerCompany(dto: CompanyRegisterDto) {
    const existing = await this.prisma.company.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('Company email already exists');

    const hash = await bcrypt.hash(dto.password, this.rounds);

    const company = await this.prisma.company.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        companyName: dto.companyName,
        phone: dto.phone ?? null,
        address: dto.address ?? null,
        industry: dto.industry ?? null,
        description: dto.description ?? null,
        url: dto.url ?? null,
        location: dto.location ?? null,
        companySize: dto.companySize ?? null,
        benefitsAndPerks: dto.benefitsAndPerks ?? null,
        profilePic: dto.profilePic ?? null,
        // status defaults to PENDING via Prisma schema
      },
      select: {
        companyId: true,
        email: true,
        companyName: true,
        phone: true,
        status: true, //  return so frontend knows it's pending
      },
    });

    const token = this.signToken({ sub: company.companyId, type: 'COMPANY' });
    return {
      token,
      company,
      message:
        'Registration successful. Your company is pending admin approval.',
    };
  }

  async loginCompany(dto: CompanyLoginDto) {
    const company = await this.prisma.company.findUnique({
      where: { email: dto.email },
    });
    if (!company) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, company.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    //  Block REJECTED / SUSPENDED from getting a token
    this.checkAccountStatus(company.status, company.rejectionReason);

    if (company.twoFactorEnabled) {
      const otp = this.generateOtpCode();
      const otpHash = await bcrypt.hash(otp, this.rounds);
      const ttlMinutes = this.getLoginOtpTtlMinutes();
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

      await this.prisma.company.update({
        where: { companyId: company.companyId },
        data: {
          loginOtpHash: otpHash,
          loginOtpExpiresAt: expiresAt,
        },
      });

      await this.mailService.sendCompanyLoginOtp(
        company.email,
        otp,
        ttlMinutes,
      );

      return {
        requiresTwoFactor: true,
        message: 'A login OTP has been sent to your email address.',
      };
    }

    const token = this.signToken({ sub: company.companyId, type: 'COMPANY' });
    return {
      token,
      requiresTwoFactor: false,
      company: {
        companyId: company.companyId,
        email: company.email,
        status: company.status, //  frontend can show "pending approval" banner
      },
    };
  }

  async verifyCompanyLoginOtp(dto: VerifyCompanyLoginOtpDto) {
    const company = await this.prisma.company.findUnique({
      where: { email: dto.email },
      select: {
        companyId: true,
        email: true,
        status: true,
        rejectionReason: true,
        twoFactorEnabled: true,
        loginOtpHash: true,
        loginOtpExpiresAt: true,
      },
    });

    if (!company) {
      throw new UnauthorizedException('Invalid OTP or email');
    }

    this.checkAccountStatus(company.status, company.rejectionReason);

    if (!company.twoFactorEnabled) {
      throw new BadRequestException(
        'Two-factor authentication is disabled for this account',
      );
    }

    if (!company.loginOtpHash || !company.loginOtpExpiresAt) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (company.loginOtpExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP has expired');
    }

    const isValid = await bcrypt.compare(dto.otp, company.loginOtpHash);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.prisma.company.update({
      where: { companyId: company.companyId },
      data: {
        loginOtpHash: null,
        loginOtpExpiresAt: null,
      },
    });

    const token = this.signToken({ sub: company.companyId, type: 'COMPANY' });
    return {
      token,
      requiresTwoFactor: false,
      company: {
        companyId: company.companyId,
        email: company.email,
        status: company.status,
      },
    };
  }

  // ─────────────────────────────────────────
  // ADMIN
  // ─────────────────────────────────────────

  async registerAdmin(dto: AdminRegisterDto) {
    const existing = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('Admin email already exists');

    const hash = await bcrypt.hash(dto.password, this.rounds);

    const admin = await this.prisma.admin.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        firstName: dto.firstName ?? null,
        lastName: dto.lastName ?? null,
        mobileNumber: dto.mobileNumber ?? null,
        address: dto.address ?? null,
      },
      select: { adminId: true, email: true, firstName: true, lastName: true },
    });

    const token = this.signToken({ sub: admin.adminId, type: 'ADMIN' });
    return { token, admin };
  }

  async loginAdmin(dto: AdminLoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken({ sub: admin.adminId, type: 'ADMIN' });
    return { token, admin: { adminId: admin.adminId, email: admin.email } };
  }
}
