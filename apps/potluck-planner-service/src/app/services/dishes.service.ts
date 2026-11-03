import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SaveDishDto } from '../dto/save-dish.dto';
import { Dish } from '../models/dish.entity';
import { PotLuckRsvp } from '../models/rsvp.entity';
import { RsvpStatus } from '../models/rsvp-status';
import { PhotosService } from './photos.service';

@Injectable()
export class DishesService {
  constructor(
    @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
    @InjectRepository(PotLuckRsvp) private readonly rsvps: Repository<PotLuckRsvp>,
    private readonly photos: PhotosService,
  ) {}

  async add(userId: string, potluckId: string, dto: SaveDishDto): Promise<void> {
    const rsvp = await this.rsvps.findOneBy({ potluckId, userId });
    if (rsvp?.status !== RsvpStatus.ATTENDING && rsvp?.status !== RsvpStatus.MAYBE) {
      throw new ForbiddenException('RSVP to this pot-luck before adding a dish.');
    }
    await this.photos.assertOwnedByUser(dto.photoUrl, userId);
    await this.dishes.save(this.dishes.create({
      potluckId,
      broughtByUserId: userId,
      name: dto.name,
      description: dto.description ?? '',
      photoUrl: dto.photoUrl ?? null,
      prepNotes: dto.prepNotes ?? '',
      suitableFor: [...new Set(dto.suitableFor ?? [])],
    }));
  }

  async update(
    userId: string,
    potluckId: string,
    dishId: string,
    dto: SaveDishDto,
  ): Promise<void> {
    const dish = await this.dishes.findOneBy({
      id: dishId,
      potluckId,
      broughtByUserId: userId,
    });
    if (!dish) throw new NotFoundException('This dish is unavailable or does not belong to you.');
    await this.photos.assertOwnedByUser(dto.photoUrl, userId);
    dish.name = dto.name;
    dish.description = dto.description ?? '';
    dish.photoUrl = dto.photoUrl ?? null;
    dish.prepNotes = dto.prepNotes ?? '';
    dish.suitableFor = [...new Set(dto.suitableFor ?? [])];
    await this.dishes.save(dish);
  }

  async getByPotluckIds(potluckIds: string[]): Promise<Dish[]> {
    if (!potluckIds.length) return [];
    return this.dishes.find({
      where: { potluckId: In(potluckIds) },
      order: { name: 'ASC' },
    });
  }
}
