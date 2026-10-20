import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateDishDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  recipeNotes?: string;

  @IsString()
  @IsOptional()
  suitableFor?: string[];
}
