import { Module } from '@nestjs/common';
import { UserNotificationsController, CompanyNotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserNotificationsController, CompanyNotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService], // ✅ exported so other modules can inject it
})
export class NotificationsModule {}
