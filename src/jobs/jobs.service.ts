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

  async create(companyId: number, dto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        companyId,
        jobTitle: dto.jobTitle,
        jobDescription: dto.jobDescription,
        qualification: dto.qualification ?? null,
        location: dto.location ?? null,
        workingHours: dto.workingHours ?? null,
        olPassRequired: dto.olPassRequired ?? null,
        imagePath: dto.imagePath ?? null,
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
        jobDescription: dto.jobDescription ?? undefined,
        qualification: dto.qualification ?? undefined,
        location: dto.location ?? undefined,
        workingHours: dto.workingHours ?? undefined,
        olPassRequired: dto.olPassRequired ?? undefined,
        imagePath: dto.imagePath ?? undefined,
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

  listCompanyJobs(companyId: number) {
    return this.prisma.job.findMany({
      where: { companyId },
      orderBy: { jobDate: 'desc' },
    });
  }
}
