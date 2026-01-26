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

  listAll() {
    return this.prisma.job.findMany({
      include: { company: { select: { companyId: true, companyName: true } } },
      orderBy: { jobDate: 'desc' },
    });
  }

  getById(id: string) {
    return this.prisma.job.findUnique({
      where: { id },
      include: { company: { select: { companyId: true, companyName: true } } },
    });
  }

  listCompanyJobs(companyId: number) {
    return this.prisma.job.findMany({
      where: { companyId },
      orderBy: { jobDate: 'desc' },
    });
  }

  async create(companyId: number, dto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        companyId,
        jobTitle: dto.jobTitle,
        jobType: dto.jobType,
        location: dto.location,
        salaryRange: dto.salaryRange,
        jobDescription: dto.jobDescription,
        requirements: dto.requirements,
        // jobDate is default(now()) in schema
      },
    });
  }

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
        requirements: dto.requirements ?? undefined,
      },
    });
  }

  async remove(companyId: number, jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.companyId !== companyId)
      throw new ForbiddenException('Not your job');

    return this.prisma.job.delete({ where: { id: jobId } });
  }
}
