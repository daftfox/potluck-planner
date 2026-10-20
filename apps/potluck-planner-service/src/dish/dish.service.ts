import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from '../models/dish.entity';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
  ) {}

  create(createDishDto: Partial<Dish>) {
    return this.dishRepository.save(createDishDto);
  }

  findAll() {
    return this.dishRepository.find();
  }

  findOne(id: string) {
    return this.dishRepository.findOne({ where: { id } });
  }

  update(id: string, updateDishDto: Partial<Dish>) {
    return this.dishRepository.save(
      { id, ...updateDishDto },
    );
  }

  remove(id: string) {
    return this.dishRepository.delete(id);
  }

  // Bulk operations per potluck
  addDishesToPotluck(potluckId: string, dishIds: string[]) {
    for (const d of dishIds) {
      this.dishRepository.save({ id: d, potluckId });
    }
  }

  removeDishesFromPotluck(potluckId: string, dishIds: string[]) {
    for (const d of dishIds) {
      this.dishRepository.save({ id: d, potluckId: null });
    }
  }
}
