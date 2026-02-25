import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobsService } from './jobs.service';

@Injectable()
export class JobsScheduler {
  private readonly logger = new Logger(JobsScheduler.name);

  constructor(private jobs: JobsService) {}

  // Runs every hour — deletes jobs whose deadline has passed
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredJobs() {
    this.logger.log('Running expired jobs cleanup...');
    const deleted = await this.jobs.deleteExpiredJobs();
    this.logger.log(`Cleanup complete — ${deleted} expired job(s) removed`);
  }
}
