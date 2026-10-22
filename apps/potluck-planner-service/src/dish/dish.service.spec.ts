import { Test, TestingModule } from '@nestjs/testing';
import { DishService } from './dish.service';
import { NotFoundException } from '@nestjs/common';
import { Dish } from '../models/dish.entity';

describe('DishService', () => {
  let service: DishService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DishService],
    }).compile();

    service = module.get<DishService>(DishService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException when removing non-existent dish', () => {
    const nonExistentId = 'non-existent-id';
    expect(service.remove(nonExistentId)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when updating non-existent dish', () => {
    const nonExistentId = 'non-existent-id';
    const updateData = { name: 'Updated Dish' };
    expect(service.update(nonExistentId, updateData)).rejects.toThrow(NotFoundException);
  });
});