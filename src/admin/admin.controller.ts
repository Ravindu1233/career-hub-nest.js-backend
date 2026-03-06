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
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';

class ReviewDto {
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AccountTypeGuard)
@AccountTypeRequired('ADMIN')
export class AdminController {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private mail: MailService,
  ) {}

  private getRequiredRejectionReason(body: ReviewDto) {
    const reason = body.rejectionReason?.trim();
    if (!reason) throw new BadRequestException('Rejection reason is required');
    return reason;
  }

  // ─────────────────────────────────────────
  // USERS — suspend / reject / reinstate
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

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    const userId = parseInt(id);
    const user = await this.prisma.user.findUnique({
      where: { userId },
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
        dob: true,
        profilePic: true,
        status: true,
        rejectionReason: true,
        reviewedAt: true,
        applications: {
          select: {
            id: true,
            status: true,
            job: { select: { jobTitle: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
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

  @Patch('users/:id/reject')
  async rejectUser(@Param('id') id: string, @Body() body: ReviewDto) {
    const userId = parseInt(id);
    const reason = this.getRequiredRejectionReason(body);
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: { userId: true, email: true },
    });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.update({
      where: { userId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedAt: new Date(),
      },
    });
    await this.notifications.createForUser(
      userId,
      'Account Rejected',
      `Your account has been rejected. Reason: ${reason}`,
      'USER_REJECTED' as any,
    );
    return { message: 'User rejected' };
  }

  @Patch('users/:id/reinstate')
  async reinstateUser(@Param('id') id: string) {
    const userId = parseInt(id);
    const user = await this.prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.status !== 'SUSPENDED')
      throw new BadRequestException('Only suspended users can be reinstated');
    await this.prisma.user.update({
      where: { userId },
      data: { status: 'ACTIVE', rejectionReason: null, reviewedAt: new Date() },
    });
    return { message: 'User reinstated' };
  }

  // ─────────────────────────────────────────
  // COMPANIES
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

  @Get('companies/pending')
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

  @Get('companies/:id')
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
        benefitsAndPerks: true,
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
    const company = await this.prisma.company.findUnique({
      where: { companyId },
      select: { companyName: true, email: true },
    });
    if (!company) throw new NotFoundException('Company not found');
    await this.prisma.company.update({
      where: { companyId },
      data: {
        status: 'APPROVED',
        rejectionReason: null,
        reviewedAt: new Date(),
      },
    });
    await this.notifications.createForCompany(
      companyId,
      'Company Approved',
      `Your company "${company.companyName}" has been approved. You can now post jobs.`,
      'COMPANY_APPROVED',
    );
    await this.mail.sendCompanyApproved(company.email, company.companyName);
    return { message: 'Company approved successfully' };
  }

  @Patch('companies/:id/reject')
  async rejectCompany(@Param('id') id: string, @Body() body: ReviewDto) {
    const companyId = parseInt(id);
    const reason = this.getRequiredRejectionReason(body);
    const company = await this.prisma.company.findUnique({
      where: { companyId },
      select: { companyName: true, email: true },
    });
    if (!company) throw new NotFoundException('Company not found');
    await this.prisma.company.update({
      where: { companyId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedAt: new Date(),
      },
    });
    await this.notifications.createForCompany(
      companyId,
      'Company Rejected',
      `Your company "${company.companyName}" has been rejected. Reason: ${reason}`,
      'COMPANY_REJECTED',
    );
    await this.mail.sendCompanyRejected(
      company.email,
      company.companyName,
      reason,
    );
    return { message: 'Company rejected' };
  }

  @Patch('companies/:id/suspend')
  async suspendCompany(@Param('id') id: string, @Body() body: ReviewDto) {
    const companyId = parseInt(id);
    const company = await this.prisma.company.findUnique({
      where: { companyId },
      select: { companyName: true, email: true },
    });
    if (!company) throw new NotFoundException('Company not found');
    await this.prisma.company.update({
      where: { companyId },
      data: {
        status: 'SUSPENDED',
        rejectionReason: body.rejectionReason ?? null,
        reviewedAt: new Date(),
      },
    });
    await this.notifications.createForCompany(
      companyId,
      'Company Suspended',
      `Your company "${company.companyName}" has been suspended.${body.rejectionReason ? ' Reason: ' + body.rejectionReason : ''}`,
      'COMPANY_SUSPENDED',
    );
    await this.mail.sendCompanySuspended(
      company.email,
      company.companyName,
      body.rejectionReason,
    );
    return { message: 'Company suspended' };
  }

  // ─────────────────────────────────────────
  // JOBS
  // ─────────────────────────────────────────

  @Get('jobs')
  jobs() {
    return this.prisma.job.findMany({
      include: { company: { select: { companyId: true, companyName: true } } },
      orderBy: { jobDate: 'desc' },
    });
  }

  @Get('jobs/pending')
  pendingJobs() {
    return this.prisma.job.findMany({
      where: { status: 'PENDING' },
      include: { company: { select: { companyId: true, companyName: true } } },
      orderBy: { jobDate: 'desc' },
    });
  }

  @Get('jobs/:id')
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
    const job = await this.prisma.job.findUnique({
      where: { id },
      select: {
        jobTitle: true,
        companyId: true,
        company: { select: { email: true } },
      },
    });
    if (!job) throw new NotFoundException('Job not found');
    await this.prisma.job.update({
      where: { id },
      data: {
        status: 'APPROVED',
        rejectionReason: null,
        reviewedAt: new Date(),
      },
    });
    await this.notifications.createForCompany(
      job.companyId,
      'Job Approved',
      `Your job "${job.jobTitle}" has been approved and is now visible to candidates.`,
      'JOB_APPROVED',
    );
    await this.mail.sendJobApproved(job.company.email, job.jobTitle);
    return { message: 'Job approved successfully' };
  }

  @Patch('jobs/:id/reject')
  async rejectJob(@Param('id') id: string, @Body() body: ReviewDto) {
    const reason = this.getRequiredRejectionReason(body);
    const job = await this.prisma.job.findUnique({
      where: { id },
      select: {
        jobTitle: true,
        companyId: true,
        company: { select: { email: true } },
      },
    });
    if (!job) throw new NotFoundException('Job not found');
    await this.prisma.job.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedAt: new Date(),
      },
    });
    await this.notifications.createForCompany(
      job.companyId,
      'Job Rejected',
      `Your job "${job.jobTitle}" has been rejected. Reason: ${reason}`,
      'JOB_REJECTED',
    );
    await this.mail.sendJobRejected(job.company.email, job.jobTitle, reason);
    return { message: 'Job rejected' };
  }

  @Patch('jobs/:id/suspend')
  async suspendJob(@Param('id') id: string, @Body() body: ReviewDto) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      select: { jobTitle: true, companyId: true },
    });
    if (!job) throw new NotFoundException('Job not found');
    await this.prisma.job.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        rejectionReason: body.rejectionReason ?? null,
        reviewedAt: new Date(),
      },
    });
    await this.notifications.createForCompany(
      job.companyId,
      'Job Suspended',
      `Your job "${job.jobTitle}" has been suspended.${body.rejectionReason ? ' Reason: ' + body.rejectionReason : ''}`,
      'JOB_REJECTED',
    );
    return { message: 'Job suspended' };
  }

  // ─────────────────────────────────────────
  // INSTITUTIONS
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

  @Get('institutions/pending')
  pendingInstitutions() {
    return this.prisma.institution.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { userId: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('institutions/:id')
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
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      select: { name: true, userId: true, user: { select: { email: true } } },
    });
    if (!institution) throw new NotFoundException('Institution not found');
    await this.prisma.institution.update({
      where: { id },
      data: {
        status: 'APPROVED',
        rejectionReason: null,
        reviewedAt: new Date(),
      },
    });
    await this.notifications.createForUser(
      institution.userId,
      'Institution Approved',
      `Your institution "${institution.name}" has been approved. You can now add courses.`,
      'INSTITUTION_APPROVED',
    );
    await this.mail.sendInstitutionApproved(
      institution.user.email,
      institution.name,
    );
    return { message: 'Institution approved successfully' };
  }

  @Patch('institutions/:id/reject')
  async rejectInstitution(@Param('id') id: string, @Body() body: ReviewDto) {
    const reason = this.getRequiredRejectionReason(body);
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      select: { name: true, userId: true, user: { select: { email: true } } },
    });
    if (!institution) throw new NotFoundException('Institution not found');
    await this.prisma.institution.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
        reviewedAt: new Date(),
      },
    });
    await this.notifications.createForUser(
      institution.userId,
      'Institution Rejected',
      `Your institution "${institution.name}" has been rejected. Reason: ${reason}`,
      'INSTITUTION_REJECTED',
    );
    await this.mail.sendInstitutionRejected(
      institution.user.email,
      institution.name,
      reason,
    );
    return { message: 'Institution rejected' };
  }

  @Patch('institutions/:id/suspend')
  async suspendInstitution(@Param('id') id: string, @Body() body: ReviewDto) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      select: { name: true, userId: true },
    });
    if (!institution) throw new NotFoundException('Institution not found');
    await this.prisma.institution.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        rejectionReason: body.rejectionReason ?? null,
        reviewedAt: new Date(),
      },
    });
    await this.notifications.createForUser(
      institution.userId,
      'Institution Suspended',
      `Your institution "${institution.name}" has been suspended.${body.rejectionReason ? ' Reason: ' + body.rejectionReason : ''}`,
      'INSTITUTION_REJECTED',
    );
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
