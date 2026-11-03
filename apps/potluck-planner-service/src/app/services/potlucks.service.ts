import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatePotLuckDto } from '../dto/create-potluck.dto';
import { UpdateRsvpDto } from '../dto/update-rsvp.dto';
import { Dish } from '../models/dish.entity';
import { PotLuck } from '../models/potluck.entity';
import { PotLuckRsvp } from '../models/rsvp.entity';
import { RsvpStatus } from '../models/rsvp-status';
import { User } from '../models/user.entity';
import { UserRole } from '../models/user-role';
import { DishesService } from './dishes.service';
import { PhotosService } from './photos.service';

export interface PotLuckView extends PotLuck {
  date: string;
  attendanceLabel: string;
  dishes: (Dish & { broughtByUserId?: string })[];
  attendees: { id: string; name: string; status: RsvpStatus }[];
  rsvpStatus?: RsvpStatus;
}

@Injectable()
export class PotlucksService {
  constructor(
    @InjectRepository(PotLuck) private readonly potlucks: Repository<PotLuck>,
    @InjectRepository(PotLuckRsvp) private readonly rsvps: Repository<PotLuckRsvp>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly dishesService: DishesService,
    private readonly photos: PhotosService,
  ) {}

  async list(userId?: string): Promise<PotLuckView[]> {
    const potlucks = await this.potlucks.find({ order: { startsOn: 'ASC', startTime: 'ASC' } });
    return this.toViews(potlucks, userId);
  }

  async get(id: string, userId?: string): Promise<PotLuckView> {
    const potluck = await this.potlucks.findOneBy({ id });
    if (!potluck) throw new NotFoundException('Pot-luck not found.');
    return (await this.toViews([potluck], userId))[0];
  }

  async create(userId: string, dto: CreatePotLuckDto): Promise<PotLuckView> {
    const date = new Date(`${dto.startsOn}T00:00:00.000Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== dto.startsOn) {
      throw new BadRequestException('Enter a valid event date.');
    }
    await this.photos.assertOwnedByUser(dto.imageUrl, userId);
    const user = await this.users.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found.');
    const potluck = await this.potlucks.save(this.potlucks.create({
      title: dto.title,
      startsOn: dto.startsOn,
      startTime: dto.startTime,
      location: dto.location,
      organiser: user.name,
      organiserUserId: user.id,
      description: dto.description ?? '',
      imageUrl: dto.imageUrl ?? null,
      imageAlt: dto.imageUrl ? dto.title : null,
    }));
    return this.get(potluck.id, userId);
  }

  async saveRsvp(userId: string, potluckId: string, dto: UpdateRsvpDto): Promise<PotLuckView> {
    if (!await this.potlucks.existsBy({ id: potluckId })) {
      throw new NotFoundException('Pot-luck not found.');
    }
    await this.rsvps.manager.transaction(async (manager) => {
      await manager.getRepository(PotLuckRsvp).upsert(
        { potluckId, userId, status: dto.status },
        ['potluckId', 'userId'],
      );
      await manager.getRepository(Dish).update(
        { potluckId, broughtByUserId: userId },
        { hiddenAfterRsvp: dto.status === RsvpStatus.NOT_GOING },
      );
    });
    return this.get(potluckId, userId);
  }

  async delete(potluckId: string, userId: string, role: UserRole): Promise<void> {
    const potluck = await this.potlucks.findOneBy({ id: potluckId });
    if (!potluck) throw new NotFoundException('Pot-luck not found.');
    if (potluck.organiserUserId !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only the organiser or an administrator can delete this pot-luck.');
    }
    await this.potlucks.remove(potluck);
  }

  private async toViews(potlucks: PotLuck[], userId?: string): Promise<PotLuckView[]> {
    const ids = potlucks.map(({ id }) => id);
    if (!ids.length) return [];
    const [dishes, rsvps] = await Promise.all([
      this.dishesService.getByPotluckIds(ids),
      this.rsvps.findBy({ potluckId: In(ids) }),
    ]);
    const attendeeUserIds = [...new Set(rsvps
      .filter((rsvp) => rsvp.status !== RsvpStatus.NOT_GOING)
      .map((rsvp) => rsvp.userId))];
    const users = attendeeUserIds.length
      ? await this.users.findBy({ id: In(attendeeUserIds) })
      : [];
    const namesByUserId = new Map(users.map((user) => [user.id, user.name]));

    return potlucks.map((potluck) => {
      const eventRsvps = rsvps.filter((rsvp) => rsvp.potluckId === potluck.id);
      const attendingRsvps = eventRsvps.filter((rsvp) => rsvp.status !== RsvpStatus.NOT_GOING);
      const eventDishes = dishes
        .filter((dish) => dish.potluckId === potluck.id)
        .filter((dish) => !dish.hiddenAfterRsvp)
        .map((dish) => ({
          ...dish,
          broughtByUserId: dish.broughtByUserId ?? undefined,
          photoUrl: dish.photoUrl ?? undefined,
        }));
      const displayDate = new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(`${potluck.startsOn}T00:00:00.000Z`));
      const personalRsvp = userId
        ? eventRsvps.find((rsvp) => rsvp.userId === userId)?.status
        : undefined;
      return {
        ...potluck,
        startTime: potluck.startTime.slice(0, 5),
        organiserUserId: potluck.organiserUserId ?? undefined,
        imageUrl: potluck.imageUrl ?? undefined,
        imageAlt: potluck.imageAlt ?? undefined,
        date: displayDate,
        attendanceLabel: `${attendingRsvps.length} ${attendingRsvps.length === 1 ? 'foodie' : 'foodies'} attending`,
        dishes: eventDishes,
        attendees: attendingRsvps.flatMap((rsvp) => {
          const name = namesByUserId.get(rsvp.userId);
          return name ? [{ id: rsvp.userId, name, status: rsvp.status }] : [];
        }),
        rsvpStatus: personalRsvp,
      };
    });
  }
}
