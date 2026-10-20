import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { RsvpModule } from './rsvp.module';
import * as request from 'supertest';

describe('RSVP Controller', () => {
  let appRef: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), RsvpModule],
    }).compile();

    appRef = moduleFixture.createNestApplication();
    await appRef.init();
  });

  it('should be defined', () => {
    expect(appRef).toBeDefined();
  });

  describe('POST /', () => {
    it('should create a new RSVP', async () => {
      const res = await request(appRef.getHttpServer())
        .post('/')
        .send({ potluckId: '1', userId: '1', attending: true })
        .expect('Content-Type', /json/);
      expect(res.body.potluckId).toBe('1');
    });

    it('should update an existing RSVP', async () => {
      const res = await request(appRef.getHttpServer())
        .post('/')
        .send({ potluckId: '1', userId: '1', attending: false })
        .expect('Content-Type', /json/);
      expect(res.body.attending).toBe(false);
    });
  });

  describe('PATCH /:potluckId/:userId', () => {
    it('should update an RSVP', async () => {
      const res = await request(appRef.getHttpServer())
        .patch('/1/1')
        .send({ attending: true })
        .expect('Content-Type', /json/);
      expect(res.body.attending).toBe(true);
    });
  });

  describe('DELETE /:potluckId/:userId', () => {
    it('should remove an RSVP', async () => {
      const res = await request(appRef.getHttpServer())
        .delete('/1/1')
        .expect('Content-Type', /json/);
      expect(res.body).toEqual({ potluckId: '1', userId: '1' });
    });
  });
});
