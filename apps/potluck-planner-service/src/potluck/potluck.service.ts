import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Potluck } from '../models/potluck.entity';
import { CreatePotluckDto } from './potluck.dto';

@Injectable()
export class PotluckService {
  constructor(
    @InjectRepository(Potluck)
    private potluckRepository: Repository<Potluck>,
  ) {}

  create(createPotluckDto: CreatePotluckDto) {
    return this.potluckRepository.save(createPotluckDto);
  }

  findAll() {
    return this.potluckRepository.find();
  }

  findOne(id: string) {
    return this.potluckRepository.findOne({ where: { id } });
  }

  update(id: string, updatePotluckDto: Partial<CreatePotluckDto>) {
    return this.potluckRepository.save(
      { id, ...updatePotluckDto },
    );
  }

  remove(id: string) {
    return this.potluckRepository.delete(id);
  }
}
