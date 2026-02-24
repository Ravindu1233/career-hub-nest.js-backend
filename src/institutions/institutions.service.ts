import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { CreateCourseDto } from '../courses/dto/create-course.dto';
import { UpdateCourseDto } from '../courses/dto/update-course.dto';

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) {}

  // =====================
  // INSTITUTION CRUD
  // =====================

  //  USER: Create institution — status defaults to PENDING via schema
  async createInstitution(userId: number, dto: CreateInstitutionDto) {
    return this.prisma.institution.create({
      data: {
        userId,
        name: dto.name,
        logo: dto.logo,
        location: dto.location,
        description: dto.description,
        website: dto.website,
        email: dto.email,
        phone: dto.phone,
        founded: dto.founded,
        students: dto.students,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true, //  return so frontend knows it's pending
      },
    });
  }

  //  PUBLIC: Get all APPROVED institutions only
  async getAllInstitutions() {
    return this.prisma.institution.findMany({
      where: { status: 'APPROVED' }, //  only approved
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        courses: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  //  USER: Get MY institutions (all statuses — so they can see pending/rejected)
  async getUserInstitutions(userId: number) {
    return this.prisma.institution.findMany({
      where: { userId },
      include: {
        courses: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  //  PUBLIC: Get single APPROVED institution by ID
  async getInstitutionById(institutionId: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePic: true,
          },
        },
        courses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!institution || institution.status !== 'APPROVED') {
      throw new NotFoundException('Institution not found');
    }

    return institution;
  }

  // USER: Update institution (only owner)
  async updateInstitution(
    userId: number,
    institutionId: string,
    dto: UpdateInstitutionDto,
  ) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) throw new NotFoundException('Institution not found');

    if (institution.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this institution');
    }

    return this.prisma.institution.update({
      where: { id: institutionId },
      data: dto,
      include: { courses: true },
    });
  }

  //  USER: Delete institution (only owner)
  async deleteInstitution(userId: number, institutionId: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) throw new NotFoundException('Institution not found');

    if (institution.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this institution');
    }

    return this.prisma.institution.delete({ where: { id: institutionId } });
  }

  // =====================
  // COURSE CRUD
  // =====================

  //  USER: Create course — institution must be APPROVED first
  async createCourse(
    userId: number,
    institutionId: string,
    dto: CreateCourseDto,
  ) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) throw new NotFoundException('Institution not found');

    if (institution.userId !== userId) {
      throw new ForbiddenException(
        'Not authorized to create courses for this institution',
      );
    }

    //  Must be approved before adding courses
    if (institution.status !== 'APPROVED') {
      throw new ForbiddenException(
        'Your institution must be approved before adding courses',
      );
    }

    return this.prisma.course.create({
      data: {
        institutionId,
        name: dto.name,
        duration: dto.duration,
        startDate: dto.startDate,
        price: dto.price,
        type: dto.type,
        spots: dto.spots,
        description: dto.description,
      },
    });
  }

  //  PUBLIC: Get courses for an APPROVED institution only
  async getInstitutionCourses(institutionId: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution || institution.status !== 'APPROVED') {
      throw new NotFoundException('Institution not found');
    }

    return this.prisma.course.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  //  PUBLIC: Get single course (only if institution is APPROVED)
  async getCourseById(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        institution: {
          include: {
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!course || course.institution.status !== 'APPROVED') {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  //  USER: Update course (only institution owner)
  async updateCourse(userId: number, courseId: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { institution: true },
    });

    if (!course) throw new NotFoundException('Course not found');

    if (course.institution.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this course');
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: dto,
    });
  }

  //  USER: Delete course (only institution owner)
  async deleteCourse(userId: number, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { institution: true },
    });

    if (!course) throw new NotFoundException('Course not found');

    if (course.institution.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this course');
    }

    return this.prisma.course.delete({ where: { id: courseId } });
  }

  //  PUBLIC: Get all courses from APPROVED institutions only
  async getAllCourses() {
    return this.prisma.course.findMany({
      where: {
        institution: { status: 'APPROVED' }, //  filter by institution status
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            logo: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
