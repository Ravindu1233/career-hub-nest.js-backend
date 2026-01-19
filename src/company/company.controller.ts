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
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompanyController {
  constructor(private prisma: PrismaService) {}

  /**
   * ✅ PUBLIC: list all companies
   * GET /companies?q=&industry=&size=
   */
  @Get()
  async list(
    @Query('q') q?: string,
    @Query('industry') industry?: string,
    @Query('size') size?: string,
  ) {
    return this.prisma.company.findMany({
      where: {
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
      },
      orderBy: { companyId: 'desc' },
    });
  }

  /**
   * ✅ PUBLIC: get single company by id
   * GET /companies/:id
   */
  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.company.findUnique({
      where: { companyId: id },
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

  /**
   * ✅ AUTH (COMPANY ONLY): get my company profile
   * GET /companies/me
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const payload = req.user;

    if (!payload?.sub || payload?.type !== 'COMPANY') {
      return null; // or throw new ForbiddenException()
    }

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
      },
    });
  }

  /**
   * ✅ AUTH (COMPANY ONLY): update my company profile
   * PATCH /companies/me
   */
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateCompanyDto) {
    const payload = req.user;

    if (!payload?.sub || payload?.type !== 'COMPANY') {
      return null;
    }

    const updateData: any = {};

    if (dto.companyName !== undefined) updateData.companyName = dto.companyName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.industry !== undefined) updateData.industry = dto.industry;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.url !== undefined) updateData.url = dto.url;
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.companySize !== undefined) updateData.companySize = dto.companySize;
    if (dto.founded !== undefined) updateData.founded = new Date(dto.founded);
    if (dto.benefitsAndPerks !== undefined)
      updateData.benefitsAndPerks = dto.benefitsAndPerks;
    if (dto.profilePic !== undefined) updateData.profilePic = dto.profilePic;

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
      },
    });
  }
}
