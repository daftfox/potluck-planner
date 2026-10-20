import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { DishModule } from '../dish/dish.module';
import * as request from 'supertest';

describe('Dish Controller', () => {
  let appRef: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), DishModule],
    }).compile();

    appRef = moduleFixture.createNestApplication();
    await appRef.init();
  });

  it('should be defined', () => {
    expect(appRef).toBeDefined();
  });

  describe('GET /', () => {
    it('should return a list of dishes', async () => {
      const res = await request(appRef.getHttpServer())
        .get('/')
        .expect('Content-Type', /json/);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /:id', () => {
    it('should return a single dish by id', async () => {
      const res = await request(appRef.getHttpServer())
        .get('/123')
        .expect('Content-Type', /json/);
      expect(res.body).toEqual({ id: '123' });
    });
  });

  describe('POST /', () => {
    it('should create a new dish', async () => {
      const res = await request(appRef.getHttpServer())
        .post('/')
        .send({ name: 'Test Dish', description: 'A test dish' })
        .expect('Content-Type', /json/);
      expect(res.body.name).toBe('Test Dish');
    });
  });

  describe('PATCH /:id', () => {
    it('should update a dish', async () => {
      const res = await request(appRef.getHttpServer())
        .patch('/123')
        .send({ name: 'Updated Dish' })
        .expect('Content-Type', /json/);
      expect(res.body.name).toBe('Updated Dish');
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a dish', async () => {
      const res = await request(appRef.getHttpServer())
        .delete('/123')
        .expect('Content-Type', /json/);
      expect(res.body).toEqual({ id: '123' });
    });
  });
});
