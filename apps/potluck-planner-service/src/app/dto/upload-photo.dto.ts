import { IsString, MaxLength, Matches } from 'class-validator';

export class UploadPhotoDto {
  @IsString()
  @MaxLength(7_000_000)
  @Matches(/^data:image\/(?:png|jpeg|gif|webp);base64,[A-Za-z0-9+/]+={0,2}$/)
  dataUrl!: string;
}
