import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { PotluckModule } from '../potluck/potluck.module';
import * as request from 'supertest';

describe('Potluck Controller', () => {
  let appRef: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), PotluckModule],
    }).compile();

    appRef = moduleFixture.createNestApplication();
    await appRef.init();
  });

  it('should be defined', () => {
    expect(appRef).toBeDefined();
  });

  describe('GET /', () => {
    it('should return a list of potlucks', async () => {
      const res = await request(appRef.getHttpServer())
        .get('/')
        .expect('Content-Type', /json/);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /:id', () => {
    it('should return a single potluck by id', async () => {
      const res = await request(appRef.getHttpServer())
        .get('/123')
        .expect('Content-Type', /json/);
      expect(res.body).toEqual({ id: '123' });
    });
  });

  describe('POST /', () => {
    it('should create a new potluck', async () => {
      const res = await request(appRef.getHttpServer())
        .post('/')
        .send({ name: 'Test Potluck' })
        .expect('Content-Type', /json/);
      expect(res.body.name).toBe('Test Potluck');
    });
  });

  describe('PATCH /:id', () => {
    it('should update a potluck', async () => {
      const res = await request(appRef.getHttpServer())
        .patch('/123')
        .send({ name: 'Updated Potluck' })
        .expect('Content-Type', /json/);
      expect(res.body.name).toBe('Updated Potluck');
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a potluck', async () => {
      const res = await request(appRef.getHttpServer())
        .delete('/123')
        .expect('Content-Type', /json/);
      expect(res.body).toEqual({ id: '123' });
    });
  });
});
