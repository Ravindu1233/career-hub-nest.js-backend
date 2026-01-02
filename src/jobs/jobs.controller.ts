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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AccountTypeRequired } from '../common/decorators/account-type.decorator';
import { AccountTypeGuard } from '../common/guards/account-type.guard';
import { JwtPayload } from '../common/types/jwt-payload.type';

@Controller('jobs')
export class JobsController {
  constructor(private jobs: JobsService) {}

  // Public: list jobs
  @Get()
  list() {
    return this.jobs.listAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.jobs.getById(id);
  }

  // Company: manage own jobs
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Get('company/me')
  companyJobs(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.jobs.listCompanyJobs(user.sub);
  }

  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Post()
  create(@Req() req: any, @Body() dto: CreateJobDto) {
    const user = req.user as JwtPayload;
    return this.jobs.create(user.sub, dto);
  }

  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateJobDto) {
    const user = req.user as JwtPayload;
    return this.jobs.update(user.sub, id, dto);
  }

  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.jobs.remove(user.sub, id);
  }
}
