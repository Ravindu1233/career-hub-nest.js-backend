import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  //  PUBLIC: Only show APPROVED jobs from APPROVED companies
  listAll() {
    return this.prisma.job.findMany({
      where: {
        status: 'APPROVED',
        company: { status: 'APPROVED' },
      },
      include: {
        company: { select: { companyId: true, companyName: true } },
      },
      orderBy: { jobDate: 'desc' },
    });
  }

  // PUBLIC: Get single job — only if approved
  async getById(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: { select: { companyId: true, companyName: true } },
      },
    });

    if (!job || job.status !== 'APPROVED') {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  // COMPANY: List own jobs (all statuses — so they see pending/rejected)
  listCompanyJobs(companyId: number) {
    return this.prisma.job.findMany({
      where: { companyId },
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
        // status defaults to PENDING via Prisma schema
      },
      select: {
        id: true,
        jobTitle: true,
        status: true, // return so frontend knows it's pending review
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
}
