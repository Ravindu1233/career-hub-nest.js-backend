import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async apply(userId: number, jobId: string, cvPath?: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    try {
      return await this.prisma.application.create({
        data: {
          jobId,
          userId,
          cvPath: cvPath ?? null,
        },
      });
    } catch (e: any) {
      // unique constraint (jobId + userId)
      throw new BadRequestException('You already applied to this job');
    }
  }

  listMyApplications(userId: number) {
    return this.prisma.application.findMany({
      where: { userId },
      include: {
        job: { include: { company: { select: { companyName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listApplicationsForCompany(companyId: number) {
    return this.prisma.application.findMany({
      where: { job: { companyId } },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            firstName: true,
            lastName: true,
            mobile: true,
          },
        },
        job: { select: { id: true, jobTitle: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async companyApplicationsForJob(companyId: number, jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.companyId !== companyId)
      throw new ForbiddenException('Not your job');

    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        user: {
          select: {
            userId: true,
            email: true,
            firstName: true,
            lastName: true,
            mobile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
