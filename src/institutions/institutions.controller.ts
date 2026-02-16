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
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { CreateCourseDto } from '../courses/dto/create-course.dto';
import { UpdateCourseDto } from '../courses/dto/update-course.dto';
import { AccountTypeRequired } from '../common/decorators/account-type.decorator';
import { AccountTypeGuard } from '../common/guards/account-type.guard';
import { JwtPayload } from '../common/types/jwt-payload.type';

@Controller('institutions')
export class InstitutionsController {
  constructor(private institutions: InstitutionsService) {}

  // =====================
  // INSTITUTION ENDPOINTS
  // =====================

  // ✅ USER: Create institution
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('USER')
  @Post()
  createInstitution(@Req() req: any, @Body() dto: CreateInstitutionDto) {
    const user = req.user as JwtPayload;
    return this.institutions.createInstitution(user.sub, dto);
  }

  // ✅ PUBLIC: Get all institutions
  @Get()
  getAllInstitutions() {
    return this.institutions.getAllInstitutions();
  }

  // ✅ USER: Get my institutions
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('USER')
  @Get('my-institutions')
  getUserInstitutions(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.institutions.getUserInstitutions(user.sub);
  }

  // ✅ PUBLIC: Get single institution
  @Get(':id')
  getInstitution(@Param('id') id: string) {
    return this.institutions.getInstitutionById(id);
  }

  // ✅ USER: Update institution (only owner)
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('USER')
  @Patch(':id')
  updateInstitution(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateInstitutionDto,
  ) {
    const user = req.user as JwtPayload;
    return this.institutions.updateInstitution(user.sub, id, dto);
  }

  // ✅ USER: Delete institution (only owner)
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('USER')
  @Delete(':id')
  deleteInstitution(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.institutions.deleteInstitution(user.sub, id);
  }

  // =====================
  // COURSE ENDPOINTS
  // =====================

  // ✅ PUBLIC: Get all courses (browse all)
  @Get('courses/all')
  getAllCourses() {
    return this.institutions.getAllCourses();
  }

  // ✅ USER: Create course for institution (only owner)
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('USER')
  @Post(':institutionId/courses')
  createCourse(
    @Req() req: any,
    @Param('institutionId') institutionId: string,
    @Body() dto: CreateCourseDto,
  ) {
    const user = req.user as JwtPayload;
    return this.institutions.createCourse(user.sub, institutionId, dto);
  }

  // ✅ PUBLIC: Get all courses for institution
  @Get(':institutionId/courses')
  getInstitutionCourses(@Param('institutionId') institutionId: string) {
    return this.institutions.getInstitutionCourses(institutionId);
  }

  // ✅ PUBLIC: Get single course
  @Get('courses/:courseId')
  getCourse(@Param('courseId') courseId: string) {
    return this.institutions.getCourseById(courseId);
  }

  // ✅ USER: Update course (only institution owner)
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('USER')
  @Patch('courses/:courseId')
  updateCourse(
    @Req() req: any,
    @Param('courseId') courseId: string,
    @Body() dto: UpdateCourseDto,
  ) {
    const user = req.user as JwtPayload;
    return this.institutions.updateCourse(user.sub, courseId, dto);
  }

  // ✅ USER: Delete course (only institution owner)
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('USER')
  @Delete('courses/:courseId')
  deleteCourse(@Req() req: any, @Param('courseId') courseId: string) {
    const user = req.user as JwtPayload;
    return this.institutions.deleteCourse(user.sub, courseId);
  }
}
