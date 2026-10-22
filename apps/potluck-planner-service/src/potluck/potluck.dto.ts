import { IsOptional, IsString, IsBoolean, IsDate, IsUUID, Max, Min, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePotluckDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
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
