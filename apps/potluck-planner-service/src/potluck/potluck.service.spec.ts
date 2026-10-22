import { Test, TestingModule } from '@nestjs/testing';
import { PotluckService } from './potluck.service';
import { Potluck } from '../models/potluck.entity';

describe('PotluckService', () => {
  let service: PotluckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PotluckService],
    }).compile();

    service = module.get<PotluckService>(PotluckService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});