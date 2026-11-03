import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../models/authenticated-user';
import { UserRole } from '../models/user-role';
import { AuthenticatedRequest } from './authenticated-request';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if ((request.user as AuthenticatedUser | undefined)?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Administrator access is required.');
    }
    return true;
  }
}
