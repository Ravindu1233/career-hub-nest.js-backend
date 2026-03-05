import { Controller, Delete, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { AccountTypeGuard } from '../common/guards/account-type.guard';
import { AccountTypeRequired } from '../common/decorators/account-type.decorator';
import { JwtPayload } from '../common/types/jwt-payload.type';

// ─────────────────────────────────────────
// USER notifications
// ─────────────────────────────────────────
@Controller('notifications/user')
@UseGuards(AuthGuard('jwt'), AccountTypeGuard)
@AccountTypeRequired('USER')
export class UserNotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // GET /notifications/user
  @Get()
  findAll(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.notificationsService.findAllForUser(user.sub);
  }

  // GET /notifications/user/unread-count
  @Get('unread-count')
  unreadCount(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.notificationsService.unreadCountForUser(user.sub);
  }

  // PATCH /notifications/user/read-all
  @Patch('read-all')
  markAllRead(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.notificationsService.markAllReadForUser(user.sub);
  }

  // PATCH /notifications/user/:id/read
  @Patch(':id/read')
  markRead(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.notificationsService.markReadForUser(user.sub, id);
  }

  // DELETE /notifications/user/:id
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.notificationsService.removeForUser(user.sub, id);
  }
}

// ─────────────────────────────────────────
// COMPANY notifications
// ─────────────────────────────────────────
@Controller('notifications/company')
@UseGuards(AuthGuard('jwt'), AccountTypeGuard)
@AccountTypeRequired('COMPANY')
export class CompanyNotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // GET /notifications/company
  @Get()
  findAll(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.notificationsService.findAllForCompany(user.sub);
  }

  // GET /notifications/company/unread-count
  @Get('unread-count')
  unreadCount(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.notificationsService.unreadCountForCompany(user.sub);
  }

  // PATCH /notifications/company/read-all
  @Patch('read-all')
  markAllRead(@Req() req: any) {
    const user = req.user as JwtPayload;
    return this.notificationsService.markAllReadForCompany(user.sub);
  }

  // PATCH /notifications/company/:id/read
  @Patch(':id/read')
  markRead(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.notificationsService.markReadForCompany(user.sub, id);
  }

  // DELETE /notifications/company/:id
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const user = req.user as JwtPayload;
    return this.notificationsService.removeForCompany(user.sub, id);
  }
}
