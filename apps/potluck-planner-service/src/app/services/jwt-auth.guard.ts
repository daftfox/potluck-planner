import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedUser } from '../models/authenticated-user';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = AuthenticatedUser | null>(
    error: unknown,
    user: AuthenticatedUser | false | null,
  ): TUser {
    if (error) return null as TUser;
    return (user || null) as TUser;
  }
}
