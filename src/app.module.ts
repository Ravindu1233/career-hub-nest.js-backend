import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { StorageModule } from './common/storage/storage.module';
import { ProfileModule } from './profile/profile.module';
import { JobsModule } from './jobs/jobs.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { CompanyModule } from './company/company.module';
import { ApplicationsModule } from './applications/applications.module';
import { InterviewsModule } from './interviews/interviews.module';
import { CoursesModule } from './courses/courses.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { ApprovedGuard } from './common/guards/approved.guard';
import { SavedJobsModule } from './saved-jobs/saved-jobs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    AuthModule,
    ProfileModule,
    JobsModule,
    AdminModule,
    UsersModule,
    CompanyModule,
    ApplicationsModule,
    InterviewsModule,
    CoursesModule,
    InstitutionsModule,
    SavedJobsModule,
    NotificationsModule,
    MailModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  providers: [ApprovedGuard], // required so PrismaService can be injected into ApprovedGuard
})
export class AppModule {}
