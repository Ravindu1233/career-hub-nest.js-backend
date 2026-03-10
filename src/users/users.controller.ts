import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/settings')
  async getMySettings(@Req() req: any) {
    const payload = req.user;

    if (!payload?.sub || payload?.type !== 'USER') {
      return null;
    }

    return this.prisma.user.findUnique({
      where: { userId: payload.sub },
      select: {
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: true,
        darkModeEnabled: true,
        twoFactorEnabled: true,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/settings')
  async updateMySettings(@Req() req: any, @Body() dto: UpdateUserSettingsDto) {
    const payload = req.user;

    if (!payload?.sub || payload?.type !== 'USER') {
      return null;
    }

    const updateData: any = {};

    if (dto.emailNotificationsEnabled !== undefined) {
      updateData.emailNotificationsEnabled = dto.emailNotificationsEnabled;
    }
    if (dto.pushNotificationsEnabled !== undefined) {
      updateData.pushNotificationsEnabled = dto.pushNotificationsEnabled;
    }
    if (dto.darkModeEnabled !== undefined) {
      updateData.darkModeEnabled = dto.darkModeEnabled;
    }
    if (dto.twoFactorEnabled !== undefined) {
      updateData.twoFactorEnabled = dto.twoFactorEnabled;
      if (!dto.twoFactorEnabled) {
        updateData.loginOtpHash = null;
        updateData.loginOtpExpiresAt = null;
      }
    }

    return this.prisma.user.update({
      where: { userId: payload.sub },
      data: updateData,
      select: {
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: true,
        darkModeEnabled: true,
        twoFactorEnabled: true,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const payload = req.user;

    if (!payload?.sub || payload?.type !== 'USER') {
      return null; // better: throw ForbiddenException
    }

    return this.prisma.user.findUnique({
      where: { userId: payload.sub },
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
        certifications: true, // Corrected to 'certifications' (plural)
        dob: true,
        olPassCount: true,
        profilePic: true,
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: true,
        darkModeEnabled: true,
        twoFactorEnabled: true,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    const payload = req.user;

    if (!payload?.sub || payload?.type !== 'USER') {
      return null;
    }

    const updateData: any = {};

    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.mobile !== undefined) updateData.mobile = dto.mobile;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.bio !== undefined) updateData.bio = dto.bio;
    if (dto.schools !== undefined) updateData.schools = dto.schools;
    if (dto.certifications !== undefined)
      updateData.certifications = dto.certifications;
    if (dto.olPassCount !== undefined) updateData.olPassCount = dto.olPassCount;
    if (dto.skills !== undefined) updateData.skills = dto.skills;

    //  CHANGE THIS - Convert date string to DateTime
    if (dto.dob !== undefined) {
      // Convert "2026-01-08" to ISO DateTime "2026-01-08T00:00:00.000Z"
      updateData.dob = new Date(dto.dob);
    }

    return this.prisma.user.update({
      where: { userId: payload.sub },
      data: updateData,
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
        dob: true,
        olPassCount: true,
        profilePic: true,
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: true,
        darkModeEnabled: true,
        twoFactorEnabled: true,
      },
    });
  }
}
