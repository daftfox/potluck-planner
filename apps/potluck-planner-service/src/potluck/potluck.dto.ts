import { IsString, IsNotEmpty } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  date: Date;
}
