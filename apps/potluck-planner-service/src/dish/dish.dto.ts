import { IsString, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class CreateDishDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  description: string;

  @IsString()
  @IsOptional()
  recipeNotes?: string;

  @IsString()
  @IsOptional()
  suitableFor?: string[];
}
