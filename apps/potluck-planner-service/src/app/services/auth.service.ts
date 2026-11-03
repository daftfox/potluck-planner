import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthSession } from '../models/auth-session.entity';
import { AuthenticatedUser } from '../models/authenticated-user';
import { User } from '../models/user.entity';
import { UserRole } from '../models/user-role';

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 24;
const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AuthSession) private readonly sessions: Repository<AuthSession>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ token: string; user: Omit<User, 'passwordHash'> }> {
    const existing = await this.users.createQueryBuilder('user')
      .where('LOWER(user.username) = :username', { username: dto.username.toLowerCase() })
      .getOne();
    if (existing) throw new ConflictException('That username is already in use.');

    let user: User;
    try {
      user = await this.users.save(this.users.create({
        name: dto.name,
        username: dto.username,
        role: UserRole.MEMBER,
        passwordHash: await hash(dto.password, BCRYPT_ROUNDS),
        dietaryPreferences: dto.dietaryPreferences,
      }));
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('That username is already in use.');
      }
      throw error;
    }
    return this.issueToken(user);
  }

  async login(dto: LoginDto): Promise<{ token: string; user: Omit<User, 'passwordHash'> }> {
    const user = await this.users.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(user.username) = :username', { username: dto.username.toLowerCase() })
      .getOne();
    if (!user || !await compare(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Username or password is incorrect.');
    }
    return this.issueToken(user);
  }

  async issueToken(user: User): Promise<{ token: string; user: Omit<User, 'passwordHash'> }> {
    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_SECONDS * 1000);
    const session = await this.sessions.save(this.sessions.create({
      jti,
      userId: user.id,
      expiresAt,
      revokedAt: null,
    }));
    try {
      const token = await this.jwt.signAsync(
        { sub: user.id, jti },
        { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
      );
      return { token, user: this.toProfile(user) };
    } catch (error) {
      await this.sessions.remove(session);
      throw error;
    }
  }

  async validateToken(userId: string, jti: string): Promise<AuthenticatedUser> {
    const session = await this.sessions.findOne({
      where: { userId, jti, revokedAt: IsNull() },
    });
    if (!session || session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Your session has expired. Please log in again.');
    }
    const user = await this.users.findOneBy({ id: userId });
    if (!user) throw new UnauthorizedException('Your account is unavailable. Please log in again.');
    return { ...this.toProfile(user), jwtId: jti };
  }

  async logout(jti: string): Promise<void> {
    await this.sessions.update(
      { jti, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) return false;
    return (error.driverError as { code?: string }).code === '23505';
  }

  toProfile(user: User): Omit<User, 'passwordHash'> {
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      dietaryPreferences: user.dietaryPreferences,
    };
  }
}
