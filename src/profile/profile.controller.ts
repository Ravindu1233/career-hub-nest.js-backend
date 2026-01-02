import {
  Controller,
  Delete,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { AccountTypeRequired } from '../common/decorators/account-type.decorator';
import { AccountTypeGuard } from '../common/guards/account-type.guard';

import { profileImageMulterOptions } from '../common/upload/profile-image.multer';
import { resizeOnDisk } from '../common/upload/sharp.util';

@Controller('profile')
export class ProfileController {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  // ---------- USER ----------
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('USER')
  @Post('user/image')
  @UseInterceptors(FileInterceptor('image', profileImageMulterOptions('users')))
  async uploadUser(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const jwt = req.user as JwtPayload;

    await resizeOnDisk(file.path, 600);
    const newPath = `/uploads/users/${file.filename}`;

    const user = await this.prisma.user.findUnique({
      where: { userId: jwt.sub },
    });
    if (user?.profilePic) await this.storage.deleteIfExists(user.profilePic);

    return this.prisma.user.update({
      where: { userId: jwt.sub },
      data: { profilePic: newPath },
      select: { userId: true, email: true, profilePic: true },
    });
  }

  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('USER')
  @Delete('user/image')
  async deleteUser(@Req() req: any) {
    const jwt = req.user as JwtPayload;
    const user = await this.prisma.user.findUnique({
      where: { userId: jwt.sub },
    });

    if (user?.profilePic) await this.storage.deleteIfExists(user.profilePic);

    return this.prisma.user.update({
      where: { userId: jwt.sub },
      data: { profilePic: null },
      select: { userId: true, email: true, profilePic: true },
    });
  }

  // ---------- COMPANY ----------
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Post('company/image')
  @UseInterceptors(
    FileInterceptor('image', profileImageMulterOptions('companies')),
  )
  async uploadCompany(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const jwt = req.user as JwtPayload;

    await resizeOnDisk(file.path, 600);
    const newPath = `/uploads/companies/${file.filename}`;

    const company = await this.prisma.company.findUnique({
      where: { companyId: jwt.sub },
    });
    if (company?.profilePic)
      await this.storage.deleteIfExists(company.profilePic);

    return this.prisma.company.update({
      where: { companyId: jwt.sub },
      data: { profilePic: newPath },
      select: {
        companyId: true,
        email: true,
        companyName: true,
        profilePic: true,
      },
    });
  }

  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('COMPANY')
  @Delete('company/image')
  async deleteCompany(@Req() req: any) {
    const jwt = req.user as JwtPayload;
    const company = await this.prisma.company.findUnique({
      where: { companyId: jwt.sub },
    });

    if (company?.profilePic)
      await this.storage.deleteIfExists(company.profilePic);

    return this.prisma.company.update({
      where: { companyId: jwt.sub },
      data: { profilePic: null },
      select: {
        companyId: true,
        email: true,
        companyName: true,
        profilePic: true,
      },
    });
  }

  // ---------- ADMIN ----------
  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('ADMIN')
  @Post('admin/image')
  @UseInterceptors(
    FileInterceptor('image', profileImageMulterOptions('admins')),
  )
  async uploadAdmin(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const jwt = req.user as JwtPayload;

    await resizeOnDisk(file.path, 600);
    const newPath = `/uploads/admins/${file.filename}`;

    const admin = await this.prisma.admin.findUnique({
      where: { adminId: jwt.sub },
    });
    if (admin?.profilePic) await this.storage.deleteIfExists(admin.profilePic);

    return this.prisma.admin.update({
      where: { adminId: jwt.sub },
      data: { profilePic: newPath },
      select: { adminId: true, email: true, profilePic: true },
    });
  }

  @UseGuards(AuthGuard('jwt'), AccountTypeGuard)
  @AccountTypeRequired('ADMIN')
  @Delete('admin/image')
  async deleteAdmin(@Req() req: any) {
    const jwt = req.user as JwtPayload;
    const admin = await this.prisma.admin.findUnique({
      where: { adminId: jwt.sub },
    });

    if (admin?.profilePic) await this.storage.deleteIfExists(admin.profilePic);

    return this.prisma.admin.update({
      where: { adminId: jwt.sub },
      data: { profilePic: null },
      select: { adminId: true, email: true, profilePic: true },
    });
  }
}
