import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../common/types/jwt-payload.type';

import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { CompanyLoginDto } from './dto/company-login.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AuthService {
  private rounds: number;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {
    this.rounds = Number(this.config.get('BCRYPT_ROUNDS') ?? 10);
  }

  // ✅ Fully fixed signToken (no overload errors)
  private signToken(payload: JwtPayload) {
    const secret = this.config.get<string>('JWT_SECRET') ?? 'CHANGE_ME';

    // ✅ Fix TS typing issue for expiresIn across versions
    const expiresIn = (this.config.get<string>('JWT_EXPIRES') ?? '7d') as any;

    return this.jwt.sign(payload, {
      secret,
      expiresIn,
    });
  }

  // ---------- USER ----------
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
      },
      select: { userId: true, email: true, firstName: true, lastName: true },
    });

    const token = this.signToken({ sub: user.userId, type: 'USER' });
    return { token, user };
  }

  async loginUser(dto: UserLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken({ sub: user.userId, type: 'USER' });
    return { token, user: { userId: user.userId, email: user.email } };
  }

  // ---------- COMPANY ----------
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
        mobile: dto.mobile ?? null,
        address: dto.address ?? null,
        industry: dto.industry ?? null,
        description: dto.description ?? null,
        url: dto.url ?? null,
      },
      select: { companyId: true, email: true, companyName: true },
    });

    const token = this.signToken({ sub: company.companyId, type: 'COMPANY' });
    return { token, company };
  }

  async loginCompany(dto: CompanyLoginDto) {
    const company = await this.prisma.company.findUnique({
      where: { email: dto.email },
    });
    if (!company) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, company.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = this.signToken({ sub: company.companyId, type: 'COMPANY' });
    return {
      token,
      company: { companyId: company.companyId, email: company.email },
    };
  }

  // ---------- ADMIN ----------
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
