import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { AccountTypeRequired } from '../common/decorators/account-type.decorator';
import { AccountTypeGuard } from '../common/guards/account-type.guard';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AccountTypeGuard)
@AccountTypeRequired('ADMIN')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('users')
  users() {
    return this.prisma.user.findMany({
      select: {
        userId: true,
        email: true,
        firstName: true,
        lastName: true,
        mobile: true, // ✅ FIX (User model has mobile)
        profilePic: true,
      },
      orderBy: { userId: 'desc' },
    });
  }

  @Get('companies')
  companies() {
    return this.prisma.company.findMany({
      select: {
        companyId: true,
        email: true,
        companyName: true,
        phone: true, // ✅ correct (Company model has phone)
        profilePic: true,
      },
      orderBy: { companyId: 'desc' },
    });
  }

  @Get('jobs')
  jobs() {
    return this.prisma.job.findMany({
      include: { company: { select: { companyId: true, companyName: true } } },
      orderBy: { jobDate: 'desc' },
    });
  }

  @Get('applications')
  applications() {
    return this.prisma.application.findMany({
      include: {
        user: { select: { userId: true, email: true } },
        job: { select: { id: true, jobTitle: true, companyId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
