import { IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateOrUpdateRsvpDto {
  @IsOptional()
  @IsBoolean()
  attending: boolean;

  @IsOptional()
  @IsUUID()
  dishId: string;
}
