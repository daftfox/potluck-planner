import { Module } from '@nestjs/common';
import { DishController } from './dish.controller';
import { DishService } from './dish.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Potluck } from '../models/potluck.entity'
import { User } from '../models/user.entity'
import { Dish } from '../models/dish.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Dish, Potluck, User])],
  controllers: [DishController],
  providers: [DishService],
  exports: [DishService],
})
export class DishModule {}
