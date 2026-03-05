import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type NotificationType =
  // User notifications
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'INTERVIEW_SCHEDULED'
  | 'USER_REJECTED'
  | 'INSTITUTION_APPROVED'
  | 'INSTITUTION_REJECTED'
  // Company notifications
  | 'NEW_APPLICATION_RECEIVED'
  | 'JOB_APPROVED'
  | 'JOB_REJECTED'
  | 'COMPANY_APPROVED'
  | 'COMPANY_REJECTED'
  | 'COMPANY_SUSPENDED';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────
  // Internal helpers — called by other services
  // ─────────────────────────────────────────

  async createForUser(userId: number, title: string, message: string, type: NotificationType) {
    return this.prisma.notification.create({
      data: { userId, title, message, type },
    });
  }

  async createForCompany(companyId: number, title: string, message: string, type: NotificationType) {
    return this.prisma.notification.create({
      data: { companyId, title, message, type },
    });
  }

  // ─────────────────────────────────────────
  // USER endpoints
  // ─────────────────────────────────────────

  async findAllForUser(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async unreadCountForUser(userId: number) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });
    return { count };
  }

  async markReadForUser(userId: number, notificationId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
    return { message: 'Marked as read' };
  }

  async markAllReadForUser(userId: number) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { message: 'All marked as read' };
  }

  async removeForUser(userId: number, notificationId: string) {
    await this.prisma.notification.deleteMany({
      where: { id: notificationId, userId },
    });
    return { message: 'Notification deleted' };
  }

  // ─────────────────────────────────────────
  // COMPANY endpoints
  // ─────────────────────────────────────────

  async findAllForCompany(companyId: number) {
    return this.prisma.notification.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async unreadCountForCompany(companyId: number) {
    const count = await this.prisma.notification.count({
      where: { companyId, read: false },
    });
    return { count };
  }

  async markReadForCompany(companyId: number, notificationId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, companyId },
      data: { read: true },
    });
    return { message: 'Marked as read' };
  }

  async markAllReadForCompany(companyId: number) {
    await this.prisma.notification.updateMany({
      where: { companyId, read: false },
      data: { read: true },
    });
    return { message: 'All marked as read' };
  }

  async removeForCompany(companyId: number, notificationId: string) {
    await this.prisma.notification.deleteMany({
      where: { id: notificationId, companyId },
    });
    return { message: 'Notification deleted' };
  }
}
