import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RSVP } from '../models/rsvp.entity';
import { CreateOrUpdateRsvpDto } from './rsvp.dto';

@Injectable()
export class RsvpService {
  constructor(
    @InjectRepository(RSVP)
    private rsvpRepository: Repository<RSVP>,
  ) {}

  createOrUpdate(dto: CreateOrUpdateRsvpDto) {
    return this.rsvpRepository.save(dto);
  }

  update(potluckId: string, userId: string, dto: Partial<{ attending: boolean; dishId: string }>) {
    const existing = this.rsvpRepository.findOne({ where: { potluckId, userId } });
    if (!existing) {
      throw new NotFoundException(`RSVP for potluck ${potluckId} by user ${userId} not found`);
    }
    return this.rsvpRepository.save({ potluckId, userId, ...dto });
  }

  remove(potluckId: string, userId: string) {
    const existing = this.rsvpRepository.findOne({ where: { potluckId, userId } });
    if (!existing) {
      throw new NotFoundException(`RSVP for potluck ${potluckId} by user ${userId} not found`);
    }
    return this.rsvpRepository.delete({ potluckId, userId });
  }

  findByPotluck(potluckId: string) {
    return this.rsvpRepository.findBy({ potluckId });
  }

  findByUser(userId: string) {
    return this.rsvpRepository.findBy({ userId });
  }
}
