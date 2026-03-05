import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const jobWithCompanySelect = {
  id: true,
  jobTitle: true,
  jobType: true,
  location: true,
  salaryRange: true,
  jobDescription: true,
  deadline: true,
  jobDate: true,
  status: true,
  company: {
    select: {
      companyId: true,
      companyName: true,
      profilePic: true,
      location: true,
      industry: true,
    },
  },
};

@Injectable()
export class SavedJobsService {
  constructor(private prisma: PrismaService) {}

  // ✅ USER: Save a job — throws if already saved or job doesn't exist
  async save(userId: number, jobId: string) {
    // Check job exists and is approved
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'APPROVED') {
      throw new NotFoundException('Job not found');
    }

    // Check not already saved
    const existing = await this.prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
    if (existing) {
      throw new ConflictException('Job already saved');
    }

    return this.prisma.savedJob.create({
      data: { userId, jobId },
      select: { id: true, jobId: true, savedAt: true },
    });
  }

  // ✅ USER: Unsave a job
  async unsave(userId: number, jobId: string) {
    const saved = await this.prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
    if (!saved) {
      throw new NotFoundException('Saved job not found');
    }

    await this.prisma.savedJob.delete({
      where: { userId_jobId: { userId, jobId } },
    });

    return { message: 'Job removed from saved list' };
  }

  // ✅ USER: Get all saved jobs with full job + company details
  async findAll(userId: number) {
    const saved = await this.prisma.savedJob.findMany({
      where: { userId },
      orderBy: { savedAt: 'desc' },
      select: {
        id: true,
        savedAt: true,
        job: {
          select: jobWithCompanySelect,
        },
      },
    });

    // Filter out any jobs that are no longer approved
    return saved.filter((s) => s.job.status === 'APPROVED');
  }

  // ✅ USER: Check if a specific job is saved
  async isSaved(userId: number, jobId: string) {
    const saved = await this.prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
    return { isSaved: !!saved };
  }
}
