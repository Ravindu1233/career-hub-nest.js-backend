import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  //  USER: Create course for institution (only owner)
  async create(userId: number, institutionId: string, dto: CreateCourseDto) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) throw new NotFoundException('Institution not found');

    if (institution.userId !== userId) {
      throw new ForbiddenException(
        'Not authorized to create courses for this institution',
      );
    }

    //  Institution must be approved before adding courses
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
    });
  }

  // PUBLIC: Get all courses from APPROVED institutions only
  async getAll() {
    return this.prisma.course.findMany({
      where: {
        institution: { status: 'APPROVED' }, //  filter by institution approval
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            logo: true,
            location: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  //  PUBLIC: Get all courses for a specific APPROVED institution
  async getByInstitution(institutionId: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) throw new NotFoundException('Institution not found');

    //  Don't show courses if institution is not approved
    if (institution.status !== 'APPROVED') {
      throw new NotFoundException('Institution not found');
    }

    return this.prisma.course.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // PUBLIC: Get single course by ID
  async getById(courseId: string) {
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
                profilePic: true,
              },
            },
          },
        },
      },
    });

    if (!course) throw new NotFoundException('Course not found');

    //  Hide course if institution is not approved
    if (course.institution.status !== 'APPROVED') {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  //  USER: Update course (only institution owner)
  async update(userId: number, courseId: string, dto: UpdateCourseDto) {
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
    });
  }

  //  USER: Delete course (only institution owner)
  async delete(userId: number, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { institution: true },
    });

    if (!course) throw new NotFoundException('Course not found');

    if (course.institution.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this course');
    }

    return this.prisma.course.delete({
      where: { id: courseId },
    });
  }
}
