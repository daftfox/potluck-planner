import { Module } from '@nestjs/common';
import { RsvpController } from './rsvp.controller';
import { RsvpService } from './rsvp.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RSVP } from '../models/rsvp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RSVP])],
  controllers: [RsvpController],
  providers: [RsvpService],
  exports: [RsvpService],
})
export class RsvpModule {}
