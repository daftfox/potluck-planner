import { Module } from '@nestjs/common';
import { PotluckController } from './potluck.controller';
import { PotluckService } from './potluck.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RSVP } from '../models/rsvp.entity'
import { Potluck } from '../models/potluck.entity'
import { User } from '../models/user.entity'
import { Dish } from '../models/dish.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Potluck, RSVP, Dish, User])],
  controllers: [PotluckController],
  providers: [PotluckService],
  exports: [PotluckService],
})
export class PotluckModule {}
