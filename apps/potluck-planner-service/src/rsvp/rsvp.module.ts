import { Module } from '@nestjs/common';
import { RsvpController } from './rsvp.controller';
import { RsvpService } from './rsvp.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RSVP } from '../models/rsvp.entity'
import { Potluck } from '../models/potluck.entity'
import { User } from '../models/user.entity'
import { Dish } from '../models/dish.entity'

@Module({
  imports: [TypeOrmModule.forFeature([RSVP, Potluck, User, Dish])],
  controllers: [RsvpController],
  providers: [RsvpService],
  exports: [RsvpService],
})
export class RsvpModule {}
