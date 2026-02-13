import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@Injectable()
export class InterviewsService {
  constructor(private prisma: PrismaService) {}

  // ✅ COMPANY: Schedule interview for an application
  async create(
    companyId: number,
    applicationId: string,
    dto: CreateInterviewDto,
  ) {
    // Check if application exists and company owns it
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.companyId !== companyId) {
      throw new ForbiddenException(
        'Not authorized to schedule interview for this application',
      );
    }

    // Validate interview date is in the future
    const interviewDateTime = new Date(dto.interviewDate);
    if (interviewDateTime <= new Date()) {
      throw new BadRequestException('Interview date must be in the future');
    }

    // Create interview
    const interview = await this.prisma.interview.create({
      data: {
        applicationId,
        interviewDate: interviewDateTime,
        interviewType: dto.interviewType,
        notes: dto.notes,
        meetingLink: dto.meetingLink,
        status: 'SCHEDULED',
      },
    });

    // Update application status to INTERVIEW_SCHEDULED
    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'INTERVIEW_SCHEDULED' },
    });

    return {
      interview,
      application: {
        id: application.id,
        user: application.user,
        job: {
          id: application.job.id,
          jobTitle: application.job.jobTitle,
        },
      },
    };
  }

  // ✅ COMPANY: Get all interviews for an application
  async getByApplication(companyId: number, applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.job.companyId !== companyId) {
      throw new ForbiddenException(
        'Not authorized to view interviews for this application',
      );
    }

    return this.prisma.interview.findMany({
      where: { applicationId },
      orderBy: { interviewDate: 'desc' },
    });
  }

  // ✅ COMPANY: Get all interviews for company's applications
  async getCompanyInterviews(companyId: number) {
    return this.prisma.interview.findMany({
      where: {
        application: {
          job: { companyId },
        },
      },
      include: {
        application: {
          include: {
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePic: true,
                mobile: true,
              },
            },
            job: {
              select: {
                id: true,
                jobTitle: true,
              },
            },
          },
        },
      },
      orderBy: { interviewDate: 'asc' },
    });
  }

  // ✅ Get single interview by ID (COMPANY or USER)
  async getById(userId: number, accountType: string, interviewId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: {
            job: {
              include: {
                company: {
                  select: {
                    companyId: true,
                    companyName: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
                mobile: true,
                profilePic: true,
              },
            },
          },
        },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    // Authorization check
    if (accountType === 'USER' && interview.application.userId !== userId) {
      throw new ForbiddenException('Not authorized to view this interview');
    }

    if (
      accountType === 'COMPANY' &&
      interview.application.job.companyId !== userId
    ) {
      throw new ForbiddenException('Not authorized to view this interview');
    }

    return interview;
  }

  // ✅ USER: Get my interviews
  async getUserInterviews(userId: number) {
    return this.prisma.interview.findMany({
      where: {
        application: {
          userId,
        },
      },
      include: {
        application: {
          include: {
            job: {
              select: {
                id: true,
                jobTitle: true,
                jobType: true,
                location: true,
                company: {
                  select: {
                    companyId: true,
                    companyName: true,
                    profilePic: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { interviewDate: 'asc' },
    });
  }

  // ✅ COMPANY: Update interview
  async update(
    companyId: number,
    interviewId: string,
    dto: UpdateInterviewDto,
  ) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: { job: true },
        },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.application.job.companyId !== companyId) {
      throw new ForbiddenException('Not authorized to update this interview');
    }

    // If updating date, validate it's in the future
    if (dto.interviewDate) {
      const newDateTime = new Date(dto.interviewDate);
      if (newDateTime <= new Date()) {
        throw new BadRequestException('Interview date must be in the future');
      }
    }

    const updateData: any = {};
    if (dto.interviewDate)
      updateData.interviewDate = new Date(dto.interviewDate);
    if (dto.interviewType) updateData.interviewType = dto.interviewType;
    if (dto.status) updateData.status = dto.status;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.meetingLink !== undefined) updateData.meetingLink = dto.meetingLink;

    return this.prisma.interview.update({
      where: { id: interviewId },
      data: updateData,
      include: {
        application: {
          include: {
            user: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            job: {
              select: {
                id: true,
                jobTitle: true,
              },
            },
          },
        },
      },
    });
  }

  // ✅ COMPANY: Cancel interview
  async cancel(companyId: number, interviewId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: { job: true },
        },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.application.job.companyId !== companyId) {
      throw new ForbiddenException('Not authorized to cancel this interview');
    }

    return this.prisma.interview.update({
      where: { id: interviewId },
      data: { status: 'CANCELLED' },
    });
  }

  // ✅ COMPANY: Delete interview
  async delete(companyId: number, interviewId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: { job: true },
        },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (interview.application.job.companyId !== companyId) {
      throw new ForbiddenException('Not authorized to delete this interview');
    }

    return this.prisma.interview.delete({
      where: { id: interviewId },
    });
  }
}
