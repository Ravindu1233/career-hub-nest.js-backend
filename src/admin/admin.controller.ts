import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { AccountTypeRequired } from '../common/decorators/account-type.decorator';
import { AccountTypeGuard } from '../common/guards/account-type.guard';
import { IsOptional, IsString } from 'class-validator';

class ReviewDto {
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AccountTypeGuard)
@AccountTypeRequired('ADMIN')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────
  // USERS
  // ✅ Simplified: SUSPEND and REINSTATE only
  //    No approve / no reject
  //    PENDING = user registered, visible to admin, no action required
  //    SUSPENDED = admin blocked the user
  //    Reinstate → returns user back to PENDING
  // ─────────────────────────────────────────

  @Get('users')
  users() {
    return this.prisma.user.findMany({
      select: {
        userId: true,
        email: true,
        firstName: true,
        lastName: true,
        mobile: true,
        profilePic: true,
        status: true,
        rejectionReason: true,
        reviewedAt: true,
      },
      orderBy: { userId: 'desc' },
    });
  }

  // ❌ DELETE the entire pendingUsers() endpoint

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    // ... no changes needed here
  }

  @Patch('users/:id/suspend')
  async suspendUser(@Param('id') id: string, @Body() body: ReviewDto) {
    const userId = parseInt(id);
    await this.prisma.user.update({
      where: { userId },
      data: {
        status: 'SUSPENDED',
        rejectionReason: body.rejectionReason ?? null,
        reviewedAt: new Date(),
      },
    });
    return { message: 'User suspended' };
  }

  @Patch('users/:id/reinstate')
  async reinstateUser(@Param('id') id: string) {
    const userId = parseInt(id);
    const user = await this.prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.status !== 'SUSPENDED') {
      throw new BadRequestException('Only suspended users can be reinstated');
    }
    await this.prisma.user.update({
      where: { userId },
      data: {
        status: 'ACTIVE', // ← was PENDING
        rejectionReason: null,
        reviewedAt: new Date(),
      },
    });
    return { message: 'User reinstated' };
  }

  // ─────────────────────────────────────────
  // COMPANIES — full approve / reject / suspend
  // ─────────────────────────────────────────

  @Get('companies')
  companies() {
    return this.prisma.company.findMany({
      select: {
        companyId: true,
        email: true,
        companyName: true,
        phone: true,
        industry: true,
        companySize: true,
        location: true,
        profilePic: true,
        status: true,
        rejectionReason: true,
        reviewedAt: true,
      },
      orderBy: { companyId: 'desc' },
    });
  }

  @Get('companies/pending') // ✅ MUST be before companies/:id
  pendingCompanies() {
    return this.prisma.company.findMany({
      where: { status: 'PENDING' },
      select: {
        companyId: true,
        email: true,
        companyName: true,
        phone: true,
        industry: true,
        companySize: true,
        profilePic: true,
        status: true,
      },
      orderBy: { companyId: 'desc' },
    });
  }

  @Get('companies/:id') // ✅ After pending
  async getCompany(@Param('id') id: string) {
    const companyId = parseInt(id);
    const company = await this.prisma.company.findUnique({
      where: { companyId },
      select: {
        companyId: true,
        email: true,
        companyName: true,
        phone: true,
        industry: true,
        companySize: true,
        location: true,
        description: true,
        url: true,
        profilePic: true,
        status: true,
        rejectionReason: true,
        reviewedAt: true,
        jobs: {
          select: { id: true, jobTitle: true, status: true },
          orderBy: { jobDate: 'desc' },
        },
      },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  @Patch('companies/:id/approve')
  async approveCompany(@Param('id') id: string) {
    const companyId = parseInt(id);
    await this.prisma.company.update({
      where: { companyId },
      data: {
        status: 'APPROVED',
        rejectionReason: null,
        reviewedAt: new Date(),
      },
    });
    return { message: 'Company approved successfully' };
  }

  @Patch('companies/:id/reject')
  async rejectCompany(@Param('id') id: string, @Body() body: ReviewDto) {
    if (!body.rejectionReason)
      throw new BadRequestException('Rejection reason is required');
    const companyId = parseInt(id);
    await this.prisma.company.update({
      where: { companyId },
      data: {
        status: 'REJECTED',
        rejectionReason: body.rejectionReason,
        reviewedAt: new Date(),
      },
    });
    return { message: 'Company rejected' };
  }

  @Patch('companies/:id/suspend')
  async suspendCompany(@Param('id') id: string, @Body() body: ReviewDto) {
    const companyId = parseInt(id);
    await this.prisma.company.update({
      where: { companyId },
      data: {
        status: 'SUSPENDED',
        rejectionReason: body.rejectionReason ?? null,
        reviewedAt: new Date(),
      },
    });
    return { message: 'Company suspended' };
  }

  // ─────────────────────────────────────────
  // JOBS — full approve / reject / suspend
  // ─────────────────────────────────────────

  @Get('jobs')
  jobs() {
    return this.prisma.job.findMany({
      include: { company: { select: { companyId: true, companyName: true } } },
      orderBy: { jobDate: 'desc' },
    });
  }

  @Get('jobs/pending') // ✅ MUST be before jobs/:id
  pendingJobs() {
    return this.prisma.job.findMany({
      where: { status: 'PENDING' },
      include: { company: { select: { companyId: true, companyName: true } } },
      orderBy: { jobDate: 'desc' },
    });
  }

  @Get('jobs/:id') // ✅ After pending
  async getJob(@Param('id') id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: { select: { companyId: true, companyName: true } },
        applications: { select: { id: true, status: true } },
      },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  @Patch('jobs/:id/approve')
  async approveJob(@Param('id') id: string) {
    await this.prisma.job.update({
      where: { id },
      data: {
        status: 'APPROVED',
        rejectionReason: null,
        reviewedAt: new Date(),
      },
    });
    return { message: 'Job approved successfully' };
  }

  @Patch('jobs/:id/reject')
  async rejectJob(@Param('id') id: string, @Body() body: ReviewDto) {
    if (!body.rejectionReason)
      throw new BadRequestException('Rejection reason is required');
    await this.prisma.job.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: body.rejectionReason,
        reviewedAt: new Date(),
      },
    });
    return { message: 'Job rejected' };
  }

  @Patch('jobs/:id/suspend')
  async suspendJob(@Param('id') id: string, @Body() body: ReviewDto) {
    await this.prisma.job.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        rejectionReason: body.rejectionReason ?? null,
        reviewedAt: new Date(),
      },
    });
    return { message: 'Job suspended' };
  }

  // ─────────────────────────────────────────
  // INSTITUTIONS — full approve / reject / suspend
  // ─────────────────────────────────────────

  @Get('institutions')
  institutions() {
    return this.prisma.institution.findMany({
      include: {
        user: { select: { userId: true, email: true } },
        courses: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('institutions/pending') // ✅ MUST be before institutions/:id
  pendingInstitutions() {
    return this.prisma.institution.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { userId: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('institutions/:id') // ✅ After pending
  async getInstitution(@Param('id') id: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      include: {
        user: { select: { userId: true, email: true } },
        courses: true,
      },
    });
    if (!institution) throw new NotFoundException('Institution not found');
    return institution;
  }

  @Patch('institutions/:id/approve')
  async approveInstitution(@Param('id') id: string) {
    await this.prisma.institution.update({
      where: { id },
      data: {
        status: 'APPROVED',
        rejectionReason: null,
        reviewedAt: new Date(),
      },
    });
    return { message: 'Institution approved successfully' };
  }

  @Patch('institutions/:id/reject')
  async rejectInstitution(@Param('id') id: string, @Body() body: ReviewDto) {
    if (!body.rejectionReason)
      throw new BadRequestException('Rejection reason is required');
    await this.prisma.institution.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: body.rejectionReason,
        reviewedAt: new Date(),
      },
    });
    return { message: 'Institution rejected' };
  }

  @Patch('institutions/:id/suspend')
  async suspendInstitution(@Param('id') id: string, @Body() body: ReviewDto) {
    await this.prisma.institution.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        rejectionReason: body.rejectionReason ?? null,
        reviewedAt: new Date(),
      },
    });
    return { message: 'Institution suspended' };
  }

  // ─────────────────────────────────────────
  // APPLICATIONS (read-only)
  // ─────────────────────────────────────────

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
