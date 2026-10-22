import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Potluck } from '../models/potluck.entity';
import { CreatePotluckDto, UpdatePotluckDto, PaginationDto } from './potluck.dto';

@Injectable()
export class PotluckService {
  constructor(
    @InjectRepository(Potluck)
    private potluckRepository: Repository<Potluck>,
  ) {}

  create(createPotluckDto: CreatePotluckDto) {
    return this.potluckRepository.save(createPotluckDto);
  }

  findAll(pagination: PaginationDto) {
    return this.potluckRepository.findAndCount({
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      order: pagination.sortBy
        ? {
            date: 'ASC',
          }
        : undefined,
    });
  }

  findOne(id: string) {
    return this.potluckRepository.findOne({ where: { id } });
  }

  update(id: string, updatePotluckDto: UpdatePotluckDto) {
    return this.potluckRepository.save(
      { id, ...updatePotluckDto },
    );
  }

  remove(id: string) {
    return this.potluckRepository.delete(id);
  }
}
