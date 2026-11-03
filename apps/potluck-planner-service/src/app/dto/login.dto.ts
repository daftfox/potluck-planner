import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/^[a-zA-Z0-9._-]+$/, {
    message: 'Username may contain only letters, numbers, dots, underscores, and hyphens.',
  })
  username!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password!: string;
}
