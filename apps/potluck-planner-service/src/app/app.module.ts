import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PotluckModule } from '../potluck/potluck.module';
import { RsvpModule } from '../rsvp/rsvp.module';
import { DishModule } from '../dish/dish.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

const dataSourceOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'potluck',
  password: process.env.DATABASE_PASSWORD || 'potluck',
  database: process.env.DATABASE_NAME || 'potluck',
  autoLoadEntities: true,
  synchronize: false,
};

@Module({
  imports: [PotluckModule, RsvpModule, DishModule,
    TypeOrmModule.forRoot(dataSourceOptions),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
