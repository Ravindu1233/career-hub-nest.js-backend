import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
  Query,
  Param,
  ParseIntPipe,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompanyController {
  constructor(private prisma: PrismaService) {}

  /**
   * PUBLIC: list all APPROVED companies only
   * GET /companies?q=&industry=&size=
   */
  @Get()
  async list(
    @Query('q') q?: string,
    @Query('industry') industry?: string,
    @Query('size') size?: string,
  ) {
    const companies = await this.prisma.company.findMany({
      where: {
        status: 'APPROVED',
        AND: [
          q
            ? {
                OR: [
                  { companyName: { contains: q, mode: 'insensitive' } },
                  { description: { contains: q, mode: 'insensitive' } },
                ],
              }
            : {},
          industry && industry !== 'All Industries' ? { industry } : {},
          size && size !== 'All Sizes' ? { companySize: size } : {},
        ],
      },
      select: {
        companyId: true,
        companyName: true,
        industry: true,
        location: true,
        companySize: true,
        description: true,
        url: true,
        profilePic: true,
        founded: true,
        _count: { select: { jobs: true } },
      },
      orderBy: { companyId: 'desc' },
    });

    return companies.map((c) => ({
      companyId: c.companyId,
      companyName: c.companyName,
      industry: c.industry,
      location: c.location,
      companySize: c.companySize,
      description: c.description,
      url: c.url,
      profilePic: c.profilePic,
      founded: c.founded,
      openJobs: c._count.jobs,
    }));
  }

  /**
   * AUTH (COMPANY ONLY): get my company profile
   * GET /companies/me
   * ✅ No ApprovedGuard — ALL statuses can read their own profile
   * IMPORTANT: Must come BEFORE @Get(':id')
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const payload = req.user;

    if (!payload) throw new UnauthorizedException('Missing auth payload');
    if (!payload.sub) throw new UnauthorizedException('Invalid token payload');
    if (payload.type !== 'COMPANY')
      throw new ForbiddenException('Only COMPANY can access this route');

    const company = await this.prisma.company.findUnique({
      where: { companyId: payload.sub },
      select: {
        companyId: true,
        companyName: true,
        email: true,
        phone: true,
        address: true,
        industry: true,
        description: true,
        url: true,
        location: true,
        companySize: true,
        founded: true,
        benefitsAndPerks: true,
        profilePic: true,
        status: true,
        rejectionReason: true,
      },
    });

    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  /**
   * AUTH (COMPANY ONLY + APPROVED/ACTIVE): update my company profile
   * PATCH /companies/me
   *
   * ✅ After a successful edit:
   *    - Company status → PENDING (requires re-approval by admin)
   *    - Jobs are NOT touched — they keep their current status
   *    - Public job listing requires BOTH company APPROVED AND job APPROVED,
   *      so while company is PENDING, all its jobs are automatically hidden
   *      from public without needing to change job statuses.
   *    - Once admin re-approves the company, all previously APPROVED jobs
   *      become visible again automatically — no extra admin action needed.
   *
   * IMPORTANT: Must come BEFORE @Get(':id')
   */
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateCompanyDto) {
    const payload = req.user;

    if (!payload) throw new UnauthorizedException('Missing auth payload');
    if (!payload.sub) throw new UnauthorizedException('Invalid token payload');
    if (payload.type !== 'COMPANY')
      throw new ForbiddenException('Only COMPANY can update this route');

    const existing = await this.prisma.company.findUnique({
      where: { companyId: payload.sub },
      select: { status: true, rejectionReason: true },
    });

    if (!existing) throw new NotFoundException('Company not found');

    // ✅ Only APPROVED or ACTIVE companies can edit their profile
    if (existing.status !== 'APPROVED' && existing.status !== 'ACTIVE') {
      throw new ForbiddenException(
        existing.status === 'PENDING'
          ? 'Your company is pending admin approval. You cannot edit your profile yet.'
          : existing.status === 'REJECTED'
            ? `Your company has been rejected. Reason: ${existing.rejectionReason ?? 'No reason provided'}`
            : existing.status === 'SUSPENDED'
              ? `Your company has been suspended. ${existing.rejectionReason ? 'Reason: ' + existing.rejectionReason : ''}`
              : 'Your company account is not active.',
      );
    }

    // ✅ Build update payload
    const updateData: any = {};

    if (dto.companyName !== undefined) updateData.companyName = dto.companyName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.industry !== undefined) updateData.industry = dto.industry;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.url !== undefined) updateData.url = dto.url;
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.companySize !== undefined) updateData.companySize = dto.companySize;
    if (dto.benefitsAndPerks !== undefined)
      updateData.benefitsAndPerks = dto.benefitsAndPerks;
    if (dto.profilePic !== undefined) updateData.profilePic = dto.profilePic;

    if (dto.founded !== undefined) {
      const d = new Date(dto.founded);
      if (Number.isNaN(d.getTime())) {
        throw new BadRequestException(
          'Invalid founded date. Use format: 2020-01-01',
        );
      }
      updateData.founded = d;
    }

    // ✅ Reset company to PENDING — admin must re-approve before it's public again
    // ✅ Jobs are NOT modified — they stay APPROVED but are hidden because
    //    the public job query filters by company.status === 'APPROVED'
    updateData.status = 'PENDING';
    updateData.rejectionReason = null;
    updateData.reviewedAt = null;

    return this.prisma.company.update({
      where: { companyId: payload.sub },
      data: updateData,
      select: {
        companyId: true,
        companyName: true,
        email: true,
        phone: true,
        address: true,
        industry: true,
        description: true,
        url: true,
        location: true,
        companySize: true,
        founded: true,
        benefitsAndPerks: true,
        profilePic: true,
        status: true,
        rejectionReason: true,
      },
    });
  }

  /**
   * PUBLIC: get single APPROVED company by id
   * GET /companies/:id
   * NOTE: must be AFTER /me routes
   */
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    const company = await this.prisma.company.findUnique({
      where: {
        companyId: id,
        status: 'APPROVED',
      },
      select: {
        companyId: true,
        companyName: true,
        industry: true,
        location: true,
        companySize: true,
        description: true,
        url: true,
        profilePic: true,
        founded: true,
        benefitsAndPerks: true,
        phone: true,
        address: true,
        email: true,
      },
    });

    if (!company) throw new NotFoundException('Company not found');
    return company;
  }
}
