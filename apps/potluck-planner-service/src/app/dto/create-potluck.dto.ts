import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePotLuckDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsDateString({ strict: true })
  startsOn!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  location!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description = '';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^\/api\/photos\/[0-9a-f-]{36}$/i)
  imageUrl?: string;
}
