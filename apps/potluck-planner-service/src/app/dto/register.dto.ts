import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DishSuitability } from '../models/dish-suitability';

export class RegisterDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message: 'Username may contain only letters, numbers, dots, underscores, and hyphens.',
  })
  username!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @IsString()
  @MinLength(8, { message: 'Password must contain at least 8 characters.' })
  @MaxLength(72)
  password!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(Object.values(DishSuitability).length)
  @IsEnum(DishSuitability, { each: true })
  dietaryPreferences: DishSuitability[] = [];
}
