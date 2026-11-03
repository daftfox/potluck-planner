import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DishSuitability } from '../models/dish-suitability';

export class UpdateProfileDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @IsArray()
  @ArrayMaxSize(Object.values(DishSuitability).length)
  @IsEnum(DishSuitability, { each: true })
  dietaryPreferences!: DishSuitability[];
}
