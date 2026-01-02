import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCOUNT_TYPE_KEY } from '../decorators/account-type.decorator';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class AccountTypeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext) {
    const allowed = this.reflector.getAllAndOverride<string[]>(
      ACCOUNT_TYPE_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!allowed || allowed.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as JwtPayload | undefined;

    if (!user) throw new UnauthorizedException('Not authenticated');
    if (!allowed.includes(user.type))
      throw new UnauthorizedException('Access denied');

    return true;
  }
}
