import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PotluckModule } from '../potluck/potluck.module';
import { RsvpModule } from '../rsvp/rsvp.module';
import { DishModule } from '../dish/dish.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../models/user.entity';

@Module({
  imports: [PotluckModule, RsvpModule, DishModule,
    TypeOrmModule.forRoot({
      type: 'postgres', // the type of your database
      host: 'localhost',
      port: 5432,
      username: 'potluck',
      password: 'potluck',
      database: 'potluck',
      autoLoadEntities: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
