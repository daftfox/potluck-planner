import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AuthController } from './controllers/auth.controller';
import { AdminController } from './controllers/admin.controller';
import { DishesController } from './controllers/dishes.controller';
import { PhotosController } from './controllers/photos.controller';
import { PotlucksController } from './controllers/potlucks.controller';
import { ProfileController } from './controllers/profile.controller';
import { InitialSchema1783040000000 } from './migrations/initial-schema.migration';
import { PotluckRolesAndDishWithdrawal1783040100000 } from './migrations/potluck-roles-and-dish-withdrawal.migration';
import { InitialAdminUser1783040200000 } from './migrations/initial-admin-user.migration';
import { Usernames1783040300000 } from './migrations/usernames.migration';
import { RemovePotluckFeatured1783040400000 } from './migrations/remove-potluck-featured.migration';
import { AuthSession } from './models/auth-session.entity';
import { Dish } from './models/dish.entity';
import { Photo } from './models/photo.entity';
import { PotLuck } from './models/potluck.entity';
import { PotLuckRsvp } from './models/rsvp.entity';
import { User } from './models/user.entity';
import { AuthService } from './services/auth.service';
import { AdminGuard } from './services/admin.guard';
import { DishesService } from './services/dishes.service';
import { JwtStrategy } from './services/jwt.strategy';
import { PhotosService } from './services/photos.service';
import { PotlucksService } from './services/potlucks.service';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/potluck-planner-service/.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PLANNER_SERVER_PORT: Joi.number().port().default(3000),
        DB_HOST: Joi.string().default('localhost'),
        DB_PORT: Joi.number().port().default(5432),
        DB_USER: Joi.string().default('postgres'),
        DB_PASSWORD: Joi.string().min(1).required(),
        DB_NAME: Joi.string().default('mydb'),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_ISSUER: Joi.string().default('potluck-planner-api'),
        JWT_AUDIENCE: Joi.string().default('potluck-planner-ui'),
        INITIAL_ADMIN_PASSWORD: Joi.string().min(8),
        UI_DIST_PATH: Joi.string(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        // Explicit so the generated production package.json includes pg (TypeORM loads it dynamically otherwise).
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        driver: require('pg'),
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        entities: [User, PotLuck, Dish, PotLuckRsvp, Photo, AuthSession],
        migrations: [
          InitialSchema1783040000000,
          PotluckRolesAndDishWithdrawal1783040100000,
          InitialAdminUser1783040200000,
          Usernames1783040300000,
          RemovePotluckFeatured1783040400000,
        ],
        migrationsRun: true,
        synchronize: false,
        retryAttempts: 10,
        retryDelay: 2000,
      }),
    }),
    TypeOrmModule.forFeature([User, PotLuck, Dish, PotLuckRsvp, Photo, AuthSession]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '24h',
          issuer: config.get<string>('JWT_ISSUER', 'potluck-planner-api'),
          audience: config.get<string>('JWT_AUDIENCE', 'potluck-planner-ui'),
        },
        verifyOptions: {
          issuer: config.get<string>('JWT_ISSUER', 'potluck-planner-api'),
          audience: config.get<string>('JWT_AUDIENCE', 'potluck-planner-ui'),
        },
      }),
    }),
  ],
  controllers: [AdminController, AuthController, DishesController, PhotosController, PotlucksController, ProfileController],
  providers: [
    AdminGuard,
    AuthService,
    DishesService,
    JwtStrategy,
    PhotosService,
    PotlucksService,
    UsersService,
  ],
})
export class AppModule {}
