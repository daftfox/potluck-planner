import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { AuthenticatedUser } from '../models/authenticated-user';

interface JwtPayload {
  sub: string;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      issuer: config.get<string>('JWT_ISSUER', 'potluck-planner-api'),
      audience: config.get<string>('JWT_AUDIENCE', 'potluck-planner-ui'),
    });
  }

  validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    return this.authService.validateToken(payload.sub, payload.jti);
  }
}
