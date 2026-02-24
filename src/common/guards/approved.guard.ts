import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ApprovedGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // set by JwtStrategy after JWT validation

    if (!user || !user.type) return false;

    const accountType: string = user.type; //  matches JwtPayload { sub, type }

    // Admins are never blocked
    if (accountType === 'ADMIN') return true;

    if (accountType === 'USER') {
      const record = await this.prisma.user.findUnique({
        where: { userId: user.sub }, //  sub is the userId for users
        select: { status: true, rejectionReason: true },
      });

      if (!record) throw new ForbiddenException('Account not found');
      this.throwIfNotApproved(record.status, record.rejectionReason);
    }

    if (accountType === 'COMPANY') {
      const record = await this.prisma.company.findUnique({
        where: { companyId: user.sub }, //  sub is the companyId for companies
        select: { status: true, rejectionReason: true },
      });

      if (!record) throw new ForbiddenException('Account not found');
      this.throwIfNotApproved(record.status, record.rejectionReason);
    }

    return true;
  }

  private throwIfNotApproved(status: string, reason?: string | null) {
    if (status === 'PENDING') {
      throw new ForbiddenException(
        'Your account is pending admin approval. Please wait for review.',
      );
    }
    if (status === 'REJECTED') {
      throw new ForbiddenException(
        `Your account has been rejected. Reason: ${reason ?? 'No reason provided'}`,
      );
    }
    if (status === 'SUSPENDED') {
      throw new ForbiddenException(
        `Your account has been suspended. ${reason ? 'Reason: ' + reason : ''}`.trim(),
      );
    }
  }
}
