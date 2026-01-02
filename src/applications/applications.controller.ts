import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApplicationsService } from './applications.service';
import { ApplyDto } from './dto/apply.dto';
import { AccountTypeRequired } from '../common/decorators/account-type.decorator';
import { AccountTypeGuard } from '../common/guards/account-type.guard';
import { JwtPayload } from '../common/types/jwt-payload.type';

@Controller('applications')
export class ApplicationsController {
  constructor(private apps: ApplicationsService) {}

  // USER: apply
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('USER')
  @Post('apply/:jobId')
  apply(@Req() req: any, @Param('jobId') jobId: string, @Body() dto: ApplyDto) {
    const user = req.user as JwtPayload;
    return this.apps.apply(user.sub, jobId, dto.cvPath);
  }

  // USER: list my applications
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('USER')
  @Get('me')
  my(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.apps.listMyApplications(user.sub);
  }

  // COMPANY: list all applications to my jobs
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Get('company/me')
  companyAll(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.apps.listApplicationsForCompany(user.sub);
  }

  // COMPANY: list applications for a specific job
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Get('company/job/:jobId')
  companyJob(@Req() req: any, @Param('jobId') jobId: string) {
    const user = req.user as JwtPayload;
    return this.apps.companyApplicationsForJob(user.sub, jobId);
  }
}
