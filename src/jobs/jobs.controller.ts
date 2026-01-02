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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

import { AccountTypeRequired } from '../common/decorators/account-type.decorator';
import { AccountTypeGuard } from '../common/guards/account-type.guard';
import { JwtPayload } from '../common/types/jwt-payload.type';

import { jobImageMulterOptions } from '../common/upload/job-image.multer';
import { SharpResizeInterceptor } from '../common/upload/sharp-resize.interceptor';

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

  // Company: list own jobs
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Get('company/me')
  companyJobs(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.jobs.listCompanyJobs(user.sub);
  }

  // ✅ Create job with optional image upload
  // Postman -> form-data: jobTitle, jobDescription, ... + image(file)
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Post()
  @UseInterceptors(FileInterceptor('image', jobImageMulterOptions))
  async create(
    @Req() req: any,
    @Body() dto: CreateJobDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const user = req.user as JwtPayload;

    let imagePath: string | null = null;

    if (file) {
      // ✅ Resize/compress after save
      await SharpResizeInterceptor.resizeOnDisk(file.path);

      imagePath = `/uploads/jobs/${file.filename}`;
    }

    return this.jobs.create(user.sub, dto, imagePath);
  }

  // ✅ Update job fields only (no image here)
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateJobDto) {
    const user = req.user as JwtPayload;
    return this.jobs.update(user.sub, id, dto);
  }

  // ✅ Upload/replace job image
  // Postman -> form-data: image(file)
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image', jobImageMulterOptions))
  async uploadJobImage(
    @Req() req: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = req.user as JwtPayload;

    // resize
    await SharpResizeInterceptor.resizeOnDisk(file.path);

    const imagePath = `/uploads/jobs/${file.filename}`;
    return this.jobs.replaceImage(user.sub, id, imagePath);
  }

  // ✅ Delete job image (keeps job)
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Delete(':id/image')
  deleteJobImage(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.jobs.deleteImage(user.sub, id);
  }

  // ✅ Delete job (also deletes image)
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.jobs.remove(user.sub, id);
  }
}
