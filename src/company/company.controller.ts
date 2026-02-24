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
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApprovedGuard } from '../common/guards/approved.guard';
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
        status: 'APPROVED', //  only show verified companies publicly
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
   *  AUTH (COMPANY ONLY): get my company profile
   * GET /companies/me
   *
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

    return this.prisma.company.findUnique({
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
        status: true, //  so frontend knows current approval state
        rejectionReason: true, //  so frontend can show reason if rejected
      },
    });
  }

  /**
   *  AUTH (COMPANY ONLY + APPROVED): update my company profile
   * PATCH /companies/me
   *
   * IMPORTANT: Must come BEFORE @Get(':id')
   */
  @UseGuards(JwtAuthGuard, ApprovedGuard)
  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateCompanyDto) {
    const payload = req.user;

    if (!payload) throw new UnauthorizedException('Missing auth payload');
    if (!payload.sub) throw new UnauthorizedException('Invalid token payload');
    if (payload.type !== 'COMPANY')
      throw new ForbiddenException('Only COMPANY can update this route');

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
        throw new BadRequestException('Invalid founded date');
      }
      updateData.founded = d;
    }

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
      },
    });
  }

  /**
   *  PUBLIC: get single APPROVED company by id
   * GET /companies/:id
   *
   * NOTE: must be AFTER /me routes
   */
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.company.findUnique({
      where: {
        companyId: id,
        status: 'APPROVED', //  only return if approved
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
  }
}
