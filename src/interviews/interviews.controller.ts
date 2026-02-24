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
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { AccountTypeRequired } from '../common/decorators/account-type.decorator';
import { AccountTypeGuard } from '../common/guards/account-type.guard';
import { JwtPayload } from '../common/types/jwt-payload.type';

@Controller('interviews')
export class InterviewsController {
  constructor(private interviews: InterviewsService) {}

  // COMPANY: Schedule interview for an application
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Post('application/:applicationId')
  create(
    @Req() req: any,
    @Param('applicationId') applicationId: string,
    @Body() dto: CreateInterviewDto,
  ) {
    const user = req.user as JwtPayload;
    return this.interviews.create(user.sub, applicationId, dto);
  }

  // COMPANY: Get all interviews for an application
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Get('application/:applicationId')
  getByApplication(
    @Req() req: any,
    @Param('applicationId') applicationId: string,
  ) {
    const user = req.user as JwtPayload;
    return this.interviews.getByApplication(user.sub, applicationId);
  }

  //  COMPANY: Get all interviews for company's applications
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Get('company/all')
  getCompanyInterviews(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.interviews.getCompanyInterviews(user.sub);
  }

  // USER: Get my interviews
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('USER')
  @Get('my-interviews')
  getUserInterviews(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.interviews.getUserInterviews(user.sub);
  }

  // Get single interview details (USER or COMPANY)
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  getInterview(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.interviews.getById(user.sub, user.type, id);
  }

  //  COMPANY: Update interview
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateInterviewDto,
  ) {
    const user = req.user as JwtPayload;
    return this.interviews.update(user.sub, id, dto);
  }

  //  COMPANY: Cancel interview
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Patch(':id/cancel')
  cancel(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.interviews.cancel(user.sub, id);
  }

  // COMPANY: Delete interview
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.interviews.delete(user.sub, id);
  }
}
