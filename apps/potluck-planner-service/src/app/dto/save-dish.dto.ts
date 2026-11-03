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

export class SaveDishDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^\/api\/photos\/[0-9a-f-]{36}$/i)
  photoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  prepNotes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(Object.values(DishSuitability).length)
  @IsEnum(DishSuitability, { each: true })
  suitableFor: DishSuitability[] = [];
}
