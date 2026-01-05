import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

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
        certification: true,
        dob: true,
        olPassCount: true,
        profilePic: true,
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

    // Build update data object with proper handling for all fields
    const updateData: any = {};

    // Handle regular string fields
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.mobile !== undefined) updateData.mobile = dto.mobile;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.bio !== undefined) updateData.bio = dto.bio;
    if (dto.schools !== undefined) updateData.schools = dto.schools;
    if (dto.certification !== undefined)
      updateData.certification = dto.certification;
    if (dto.olPassCount !== undefined) updateData.olPassCount = dto.olPassCount;

    // ✅ CRITICAL FIX: Always update skills array if provided
    if (dto.skills !== undefined) {
      updateData.skills = dto.skills;
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
        certification: true,
        dob: true,
        olPassCount: true,
        profilePic: true,
      },
    });
  }
}
