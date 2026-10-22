import { IsOptional, IsString, IsBoolean, IsDate, IsUUID, Max, Min, IsNotEmpty, IsNumber, MinLength } from 'class-validator';

export class CreatePotluckDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  organiserId: string;

  @IsDate()
  date: Date;
}

export class UpdatePotluckDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsUUID()
  date?: Date;
}

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  page = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsBoolean()
  sortBy = false;
}
