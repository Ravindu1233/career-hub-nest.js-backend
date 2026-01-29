import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { applicationCvMulterOptions } from '../common/upload/application-cv.multer';

import { AccountTypeRequired } from '../common/decorators/account-type.decorator';
import { AccountTypeGuard } from '../common/guards/account-type.guard';
import { JwtPayload } from '../common/types/jwt-payload.type';

@Controller('applications')
export class ApplicationsController {
  constructor(private applications: ApplicationsService) {}

  // ✅ USER: Apply to a job (with optional CV upload)
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('USER')
  @Post('apply/:jobId')
  @UseInterceptors(FileInterceptor('cv', applicationCvMulterOptions))
  async apply(
    @Req() req: any,
    @Param('jobId') jobId: string,
    @Body() dto: CreateApplicationDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const user = req.user as JwtPayload;

    if (!file) {
      throw new BadRequestException('CV file is required');
    }

    return this.applications.create(user.sub, jobId, dto, file.path);
  }

  // ✅ USER: Get my applications
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('USER')
  @Get('my-applications')
  myApplications(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.applications.getUserApplications(user.sub);
  }

  // ✅ COMPANY: Get applications for a specific job
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Get('job/:jobId')
  jobApplications(@Req() req: any, @Param('jobId') jobId: string) {
    const user = req.user as JwtPayload;
    return this.applications.getJobApplications(user.sub, jobId);
  }

  // ✅ COMPANY: Get all applications for company's jobs
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Get('company/all')
  companyApplications(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.applications.getCompanyApplications(user.sub);
  }

  // ✅ Get single application details (USER or COMPANY)
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  getApplication(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.applications.getById(user.sub, user.type, id); // ✅ Changed from accountType to type
  }

  // ✅ COMPANY: Update application status
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Patch(':id/status')
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    const user = req.user as JwtPayload;
    return this.applications.updateStatus(user.sub, id, dto);
  }

  // ✅ USER: Withdraw application
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('USER')
  @Delete(':id')
  withdraw(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.applications.withdraw(user.sub, id);
  }
}
