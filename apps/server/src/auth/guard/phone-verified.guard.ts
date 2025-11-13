import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class PhoneVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context).getContext();
    const user = ctx.req.user;

    if (!user) throw new ForbiddenException('Unauthorized');
    if (!user.phoneVerified)
      throw new ForbiddenException('Phone registration required');

    return true;
  }
}
