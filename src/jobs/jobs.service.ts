import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

// Full company fields needed by the frontend JobDetails page
const companySelect = {
  companyId: true,
  companyName: true,
  industry: true,
  companySize: true,
  description: true,
  url: true,
  benefitsAndPerks: true,
  location: true,
  profilePic: true,
};

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  //  PUBLIC: Only show APPROVED jobs from APPROVED companies
  //  Also exclude expired (deadline passed) jobs
  listAll() {
    return this.prisma.job.findMany({
      where: {
        status: 'APPROVED',
        company: { status: 'APPROVED' },
        OR: [
          { deadline: null }, // no deadline = always visible
          { deadline: { gt: new Date() } }, // deadline in the future
        ],
      },
      include: {
        company: { select: companySelect },
        _count: { select: { applications: true } }, // applicant count
      },
      orderBy: { jobDate: 'desc' },
    });
  }

  // PUBLIC: Get single job — only if approved and not expired
  async getById(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: { select: companySelect },
        applications: { select: { id: true } },
      },
    });

    if (!job || job.status !== 'APPROVED') {
      throw new NotFoundException('Job not found');
    }

    // Block access if deadline passed
    if (job.deadline && new Date() > job.deadline) {
      throw new NotFoundException('This job listing has expired');
    }

    return {
      ...job,
      applicantCount: job.applications.length,
      // isFull: true means apply button should be disabled on frontend
      isFull:
        job.maxApplicants != null
          ? job.applications.length >= job.maxApplicants
          : false,
    };
  }

  // COMPANY: List own jobs (all statuses — so they see pending/rejected)
  listCompanyJobs(companyId: number) {
    return this.prisma.job.findMany({
      where: { companyId },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { jobDate: 'desc' },
    });
  }

  //  COMPANY: Create job — defaults to PENDING via schema
  async create(companyId: number, dto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        companyId,
        jobTitle: dto.jobTitle,
        jobType: dto.jobType,
        location: dto.location,
        salaryRange: dto.salaryRange,
        jobDescription: dto.jobDescription,
        responsibilities: dto.responsibilities,
        requiredSkills: dto.requiredSkills,
        requirements: dto.requirements,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        maxApplicants: dto.maxApplicants ?? null,
      },
      select: {
        id: true,
        jobTitle: true,
        status: true,
        maxApplicants: true,
        deadline: true,
      },
    });
  }

  //  COMPANY: Update own job
  async update(companyId: number, jobId: string, dto: UpdateJobDto) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.companyId !== companyId)
      throw new ForbiddenException('Not your job');

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        jobTitle: dto.jobTitle ?? undefined,
        jobType: dto.jobType ?? undefined,
        location: dto.location ?? undefined,
        salaryRange: dto.salaryRange ?? undefined,
        jobDescription: dto.jobDescription ?? undefined,
        responsibilities: dto.responsibilities ?? undefined,
        requiredSkills: dto.requiredSkills ?? undefined,
        requirements: dto.requirements ?? undefined,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        maxApplicants: dto.maxApplicants ?? undefined,
      },
    });
  }

  // COMPANY: Delete own job
  async remove(companyId: number, jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.companyId !== companyId)
      throw new ForbiddenException('Not your job');

    return this.prisma.job.delete({ where: { id: jobId } });
  }

  // SCHEDULER: Delete all jobs whose deadline has passed
  // Called automatically every hour by JobsScheduler
  async deleteExpiredJobs(): Promise<number> {
    const result = await this.prisma.job.deleteMany({
      where: {
        deadline: { lt: new Date() },
      },
    });
    console.log(`[JobsScheduler] Deleted ${result.count} expired jobs`);
    return result.count;
  }
}
