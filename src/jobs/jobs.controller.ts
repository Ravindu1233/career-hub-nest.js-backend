import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

import { AccountTypeRequired } from '../common/decorators/account-type.decorator';
import { AccountTypeGuard } from '../common/guards/account-type.guard';
import { ApprovedGuard } from '../common/guards/approved.guard';
import { JwtPayload } from '../common/types/jwt-payload.type';

@Controller('jobs')
export class JobsController {
  constructor(private jobs: JobsService) {}

  //  PUBLIC: Only APPROVED jobs from APPROVED companies
  @Get()
  list() {
    return this.jobs.listAll();
  }

  //  COMPANY: My jobs (all statuses) — MUST be BEFORE /company/:companyId
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Get('company/me')
  companyJobs(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.jobs.listCompanyJobs(user.sub);
  }

  //  PUBLIC: Jobs by company ID (approved only — filtered in service)
  @Get('company/:companyId')
  listByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.jobs.listCompanyJobs(companyId);
  }

  // PUBLIC: Single job (approved only — filtered in service)
  @Get(':id')
  get(@Param('id') id: string) {
    return this.jobs.getById(id);
  }

  // COMPANY (APPROVED): Create job — starts as PENDING
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard, ApprovedGuard)
  @AccountTypeRequired('COMPANY')
  @Post()
  create(@Req() req: any, @Body() dto: CreateJobDto) {
    const user = req.user as JwtPayload;
    return this.jobs.create(user.sub, dto);
  }

  //  COMPANY (APPROVED): Update own job
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard, ApprovedGuard)
  @AccountTypeRequired('COMPANY')
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateJobDto) {
    const user = req.user as JwtPayload;
    return this.jobs.update(user.sub, id, dto);
  }

  // COMPANY (APPROVED): Delete own job
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard, ApprovedGuard)
  @AccountTypeRequired('COMPANY')
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.jobs.remove(user.sub, id);
  }
}
