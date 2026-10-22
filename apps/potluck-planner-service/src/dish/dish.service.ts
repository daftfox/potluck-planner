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
  async addDishesToPotluck(potluckId: string, dishIds: string[]) {
    const queryRunner = this.dishRepository.manager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.query(
        `INSERT INTO "dishes" ("id", "name", "description", "recipeNotes", "suitableFor", "potluckId")
         VALUES ($1, $2, $3, $4, $5, $6)
         WHERE $6 NOT IN (SELECT "potluckId" FROM "dishes")
         RETURNING "id"`,
        [...dishIds, '', '', '', '', potluckId],  // id, name, description, recipeNotes, suitableFor, potluckId
      );

      await queryRunner.commitTransaction();
      return { inserted: dishIds.length };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Bulk remove dishes from potluck
  async removeDishesFromPotluck(potluckId: string, dishIds: string[]) {
    const queryRunner = this.dishRepository.manager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.query(
        `UPDATE "dishes" SET "potluckId" = NULL
         WHERE "id" = ANY($1::uuid[]) AND "potluckId" = $2`,
        [dishIds, potluckId],
      );

      await queryRunner.commitTransaction();
      return { removed: dishIds.length };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
