import { Module } from '@nestjs/common';
import { PotluckController } from './potluck.controller';
import { PotluckService } from './potluck.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RsvpModule } from '../rsvp/rsvp.module';
import { Potluck } from '../models/potluck.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Potluck]), RsvpModule],
  controllers: [PotluckController],
  providers: [PotluckService],
  exports: [PotluckService],
})
export class PotluckModule {}
