import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    jobId: string,
    dto: CreateApplicationDto,
    cvPath: string,
  ) {
    // Check if job exists
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    // Check if deadline has passed
    if (job.deadline && new Date() > job.deadline) {
      throw new BadRequestException('Application deadline has passed');
    }

    // Check if user already applied
    const existing = await this.prisma.application.findUnique({
      where: { jobId_userId: { jobId, userId } },
    });

    if (existing) {
      throw new BadRequestException('You have already applied to this job');
    }

    return this.prisma.application.create({
      data: {
        jobId,
        userId,
        cvPath,
        coverLetter: dto.coverLetter,
        status: 'PENDING', // Default status is PENDING
      },
      include: {
        job: {
          select: {
            jobTitle: true,
            company: { select: { companyName: true } },
          },
        },
      },
    });
  }

  // ✅ Get user's applications
  async getUserApplications(userId: number) {
    return this.prisma.application.findMany({
      where: { userId },
      include: {
        job: {
          select: {
            id: true,
            jobTitle: true,
            jobType: true,
            location: true,
            salaryRange: true,
            deadline: true,
            company: {
              select: {
                companyId: true,
                companyName: true,
                profilePic: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Get applications for a specific job (Company only)
  async getJobApplications(companyId: number, jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) throw new NotFoundException('Job not found');
    if (job.companyId !== companyId) {
      throw new ForbiddenException('Not authorized to view these applications');
    }

    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            mobile: true,
            profilePic: true,
            bio: true,
            skills: true,
            schools: true,
            certifications: true,
            olPassCount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Get all applications for company's jobs
  async getCompanyApplications(companyId: number) {
    return this.prisma.application.findMany({
      where: {
        job: { companyId },
      },
      include: {
        job: {
          select: {
            id: true,
            jobTitle: true,
            jobType: true,
          },
        },
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
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Get single application by ID
  async getById(userId: number, accountType: string, applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: {
              select: {
                companyId: true,
                companyName: true,
                profilePic: true,
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
            bio: true,
            skills: true,
            schools: true,
            certifications: true,
            olPassCount: true,
          },
        },
      },
    });

    if (!application) throw new NotFoundException('Application not found');

    // Authorization check
    if (accountType === 'USER' && application.userId !== userId) {
      throw new ForbiddenException('Not authorized to view this application');
    }

    if (accountType === 'COMPANY' && application.job.companyId !== userId) {
      throw new ForbiddenException('Not authorized to view this application');
    }

    return application;
  }

  async updateStatus(
    companyId: number,
    applicationId: string, // ✅ Remove '| undefined' - controller guarantees it exists
    dto: UpdateApplicationDto,
  ) {
    // Remove the undefined check since it's now guaranteed to be a string
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) throw new NotFoundException('Application not found');

    // Ensure the company owns the job
    if (application.job.companyId !== companyId) {
      throw new ForbiddenException('Not authorized to update this application');
    }

    // Check if the new status is one of the allowed ones
    const validStatuses = [
      'PENDING',
      'REJECTED',
      'INTERVIEW_SCHEDULED',
      'SHORTLISTED',
    ];
    if (!validStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Status must be one of: ${validStatuses.join(', ')}`,
      );
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: dto.status },
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
    });
  }
  // ✅ Withdraw application (User only)
  async withdraw(userId: number, applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) throw new NotFoundException('Application not found');

    if (application.userId !== userId) {
      throw new ForbiddenException(
        'Not authorized to withdraw this application',
      );
    }

    return this.prisma.application.delete({
      where: { id: applicationId },
    });
  }
}
