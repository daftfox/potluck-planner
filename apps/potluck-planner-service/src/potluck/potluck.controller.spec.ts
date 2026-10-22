import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PotluckController } from './potluck.controller';
import { PotluckService } from './potluck.service';
import { Potluck } from '../models/potluck.entity';
import { CreatePotluckDto, UpdatePotluckDto, PaginationDto } from './potluck.dto';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

describe('PotluckController', () => {
  let controller: PotluckController;

  const mockPotluckData: Potluck[] = [
    {
      id: '1',
      name: 'Potluck 1',
      description: 'Description 1',
      organiserId: 'user1',
      date: new Date('2024-01-01'),
      organiser: null,
    },
    {
      id: '2',
      name: 'Potluck 2',
      description: 'Description 2',
      organiserId: 'user2',
      date: new Date('2024-01-02'),
      organiser: null,
    },
  ];

  const mockPagination: PaginationDto = {
    page: 1,
    limit: 2,
    sortBy: false,
  };

  const mockUpdate: UpdatePotluckDto = {
    name: 'Updated Name',
  };

  const mockCreate: CreatePotluckDto = {
    name: 'New Potluck',
    description: 'New Description',
    organiserId: 'user1',
    date: new Date('2024-02-01'),
  };

  const mockPotluckService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    mockPotluckService.findAll.mockResolvedValue([mockPotluckData]);
    mockPotluckService.findOne.mockResolvedValue(mockPotluckData[0]);
    mockPotluckService.create.mockResolvedValue(mockPotluckData[0]);
    mockPotluckService.update.mockResolvedValue(mockPotluckData[0]);
    mockPotluckService.remove.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      controllers: [PotluckController],
      providers: [
        {
          provide: PotluckService,
          useValue: mockPotluckService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PotluckController>(PotluckController);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a potluck', async () => {
      const result = await controller.create(mockCreate);
      expect(result).toEqual(mockPotluckData[0]);
      expect(mockPotluckService.create).toHaveBeenCalledWith(mockCreate);
    });
  });

  describe('findAll', () => {
    it('should return all potlucks with pagination', async () => {
      const result = await controller.findAll(mockPagination);
      expect(result[0]).toEqual(mockPotluckData);
      expect(mockPotluckService.findAll).toHaveBeenCalledWith(mockPagination);
    });

    it('should handle empty pagination', async () => {
      const result = await controller.findAll({ page: 1, limit: 10, sortBy: false });
      expect(result[0]).toEqual(mockPotluckData);
    });
  });

  describe('findOne', () => {
    it('should return a single potluck', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual({
        id: '1',
        name: 'Potluck 1',
        description: 'Description 1',
        organiserId: 'user1',
        date: expect.any(Date),
        organiser: null,
      });
      expect(mockPotluckService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a potluck', async () => {
      const result = await controller.update('1', mockUpdate);
      expect(result).toEqual(mockPotluckData[0]);
      expect(mockPotluckService.update).toHaveBeenCalledWith('1', mockUpdate);
    });
  });

  describe('remove', () => {
    it('should remove a potluck', async () => {
      await controller.remove('1');
      expect(mockPotluckService.remove).toHaveBeenCalledWith('1');
    });
  });
});
