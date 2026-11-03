import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { User } from '../models/user.entity';
import { UserRole } from '../models/user-role';
import { AuthService } from './auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.users.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found.');
    return this.authService.toProfile(user);
  }

  async listUsers(): Promise<{ id: string; username: string | null; name: string; role: UserRole }[]> {
    const users = await this.users.find({
      select: { id: true, username: true, name: true, role: true },
      order: { name: 'ASC' },
    });
    return users.map(({ id, username, name, role }) => ({ id, username, name, role }));
  }

  async updateRole(actorId: string, userId: string, role: UserRole) {
    if (actorId === userId) {
      throw new ForbiddenException('You cannot change your own role.');
    }
    return this.users.manager.transaction(async (manager) => {
      const users = manager.getRepository(User);
      const user = await users.findOneBy({ id: userId });
      if (!user) throw new NotFoundException('User not found.');
      if (user.role === role) {
        return { id: user.id, username: user.username, name: user.name, role: user.role };
      }
      if (user.role === UserRole.ADMIN && role === UserRole.MEMBER) {
        const admins = await users.createQueryBuilder('user')
          .where('user.role = :role', { role: UserRole.ADMIN })
          .setLock('pessimistic_write')
          .getMany();
        if (admins.length <= 1) {
          throw new BadRequestException('The last administrator cannot be changed to a member.');
        }
      }
      user.role = role;
      const updated = await users.save(user);
      return { id: updated.id, username: updated.username, name: updated.name, role: updated.role };
    });
  }

  async deleteUser(actorId: string, userId: string) {
    if (actorId === userId) {
      throw new ForbiddenException('You cannot delete your own account.');
    }

    return this.users.manager.transaction(async (manager) => {
      const users = manager.getRepository(User);
      const admins = await users.createQueryBuilder('user')
        .where('user.role = :role', { role: UserRole.ADMIN })
        .setLock('pessimistic_write')
        .getMany();
      const user = await users.findOneBy({ id: userId });
      if (!user) throw new NotFoundException('User not found.');
      if (user.role === UserRole.ADMIN && admins.length <= 1) {
        throw new BadRequestException('The last administrator cannot be deleted.');
      }

      const deleted = { id: user.id, username: user.username, name: user.name, role: user.role };
      await users.remove(user);
      return deleted;
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.users.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found.');

    user.name = dto.name;
    user.dietaryPreferences = [...new Set(dto.dietaryPreferences)];
    return this.authService.toProfile(await this.users.save(user));
  }
}
