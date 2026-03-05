import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { SavedJobsService } from './saved-jobs.service';
import { AccountTypeGuard } from '../common/guards/account-type.guard';
import { AccountTypeRequired } from '../common/decorators/account-type.decorator';
import { JwtPayload } from '../common/types/jwt-payload.type';

@Controller('saved-jobs')
@UseGuards(AuthGuard('jwt'), AccountTypeGuard)
@AccountTypeRequired('USER')
export class SavedJobsController {
  constructor(private savedJobsService: SavedJobsService) {}

  // GET /saved-jobs
  // Returns all saved jobs for the logged-in user
  @Get()
  findAll(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.savedJobsService.findAll(user.sub);
  }

  // GET /saved-jobs/:jobId/status
  // Check if a specific job is saved — used for bookmark toggle UI
  // MUST be before /:jobId to avoid route conflict
  @Get(':jobId/status')
  isSaved(@Req() req: any, @Param('jobId') jobId: string) {
    const user = req.user as JwtPayload;
    return this.savedJobsService.isSaved(user.sub, jobId);
  }

  // POST /saved-jobs/:jobId
  // Save a job
  @Post(':jobId')
  save(@Req() req: any, @Param('jobId') jobId: string) {
    const user = req.user as JwtPayload;
    return this.savedJobsService.save(user.sub, jobId);
  }

  // DELETE /saved-jobs/:jobId
  // Unsave a job
  @Delete(':jobId')
  unsave(@Req() req: any, @Param('jobId') jobId: string) {
    const user = req.user as JwtPayload;
    return this.savedJobsService.unsave(user.sub, jobId);
  }
}
