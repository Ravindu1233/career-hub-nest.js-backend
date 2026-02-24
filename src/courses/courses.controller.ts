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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AccountTypeRequired } from '../common/decorators/account-type.decorator';
import { AccountTypeGuard } from '../common/guards/account-type.guard';
import { ApprovedGuard } from '../common/guards/approved.guard';
import { JwtPayload } from '../common/types/jwt-payload.type';

@Controller('courses')
export class CoursesController {
  constructor(private courses: CoursesService) {}

  //  USER (APPROVED): Create course for institution (only owner)
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard, ApprovedGuard)
  @AccountTypeRequired('USER')
  @Post('institution/:institutionId')
  create(
    @Req() req: any,
    @Param('institutionId') institutionId: string,
    @Body() dto: CreateCourseDto,
  ) {
    const user = req.user as JwtPayload;
    return this.courses.create(user.sub, institutionId, dto);
  }

  // PUBLIC: Get all courses
  @Get()
  getAll() {
    return this.courses.getAll();
  }

  //  PUBLIC: Get all courses for an institution
  @Get('institution/:institutionId')
  getByInstitution(@Param('institutionId') institutionId: string) {
    return this.courses.getByInstitution(institutionId);
  }

  // PUBLIC: Get single course
  @Get(':id')
  getCourse(@Param('id') id: string) {
    return this.courses.getById(id);
  }

  // USER (APPROVED): Update course (only institution owner)
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard, ApprovedGuard)
  @AccountTypeRequired('USER')
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    const user = req.user as JwtPayload;
    return this.courses.update(user.sub, id, dto);
  }

  //  USER (APPROVED): Delete course (only institution owner)
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard, ApprovedGuard)
  @AccountTypeRequired('USER')
  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.courses.delete(user.sub, id);
  }
}
