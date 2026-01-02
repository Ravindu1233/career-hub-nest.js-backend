import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

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

  async create(
    companyId: number,
    dto: CreateJobDto,
    imagePath?: string | null,
  ) {
    return this.prisma.job.create({
      data: {
        companyId,
        jobTitle: dto.jobTitle,
        jobDescription: dto.jobDescription,
        qualification: dto.qualification ?? null,
        location: dto.location ?? null,
        workingHours: dto.workingHours ?? null,
        olPassRequired: dto.olPassRequired ?? null,
        imagePath: imagePath ?? null,
      },
    });
  }

  async update(companyId: number, jobId: string, dto: UpdateJobDto) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.companyId !== companyId) {
      throw new ForbiddenException('Not your job');
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        jobTitle: dto.jobTitle ?? undefined,
        jobDescription: dto.jobDescription ?? undefined,
        qualification: dto.qualification ?? undefined,
        location: dto.location ?? undefined,
        workingHours: dto.workingHours ?? undefined,
        olPassRequired: dto.olPassRequired ?? undefined,
      },
    });
  }

  // ✅ Replace image: deletes old file, sets new path
  async replaceImage(companyId: number, jobId: string, newImagePath: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.companyId !== companyId) {
      // delete newly uploaded file if not owner (avoid junk files)
      await this.storage.deleteIfExists(newImagePath);
      throw new ForbiddenException('Not your job');
    }

    // delete old image if exists
    await this.storage.deleteIfExists(job.imagePath);

    return this.prisma.job.update({
      where: { id: jobId },
      data: { imagePath: newImagePath },
    });
  }

  // ✅ Delete image only (keeps job)
  async deleteImage(companyId: number, jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.companyId !== companyId) {
      throw new ForbiddenException('Not your job');
    }

    await this.storage.deleteIfExists(job.imagePath);

    return this.prisma.job.update({
      where: { id: jobId },
      data: { imagePath: null },
    });
  }

  // ✅ Delete job and its image
  async remove(companyId: number, jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.companyId !== companyId) {
      throw new ForbiddenException('Not your job');
    }

    await this.storage.deleteIfExists(job.imagePath);

    return this.prisma.job.delete({ where: { id: jobId } });
  }
}
