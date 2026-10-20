import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PotluckModule } from '../potluck/potluck.module';
import { PotluckService } from '../potluck/potluck.service';
import { CreatePotluckDto } from '../potluck/potluck.dto';

describe('Potluck Service', () => {
  let service: PotluckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), PotluckModule],
    }).compile();

    service = module.get<PotluckService>(PotluckService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new potluck', () => {
      const dto: CreatePotluckDto = {
        name: 'Test Potluck',
        description: 'A test potluck',
        organiser: 'test@example.com',
        date: new Date('2024-01-01'),
      };
      const result = service.create(dto);
      expect(result.name).toBe('Test Potluck');
    });
  });

  describe('findAll', () => {
    it('should return an array of potlucks', () => {
      const result = service.findAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a single potluck by id', () => {
      const result = service.findOne('123');
      expect(result).toEqual({ id: '123' });
    });
  });

  describe('update', () => {
    it('should update a potluck', () => {
      const updateDto = { name: 'Updated Potluck' };
      const result = service.update('123', updateDto);
      expect(result.name).toBe('Updated Potluck');
    });
  });

  describe('remove', () => {
    it('should remove a potluck', () => {
      const result = service.remove('123');
      expect(result).toEqual({ id: '123' });
    });
  });
});
