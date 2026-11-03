import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadPhotoDto } from '../dto/upload-photo.dto';
import { Photo } from '../models/photo.entity';
import { PHOTO_CONTENT_TYPES, PhotoContentType } from '../models/photo-content-type';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_SIGNATURES: Record<PhotoContentType, (data: Buffer) => boolean> = {
  'image/png': (data) => data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
  'image/jpeg': (data) => data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff,
  'image/gif': (data) => data.subarray(0, 3).toString('ascii') === 'GIF',
  'image/webp': (data) =>
    data.subarray(0, 4).toString('ascii') === 'RIFF' &&
    data.subarray(8, 12).toString('ascii') === 'WEBP',
};

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo) private readonly photos: Repository<Photo>,
  ) {}

  async save(userId: string, dto: UploadPhotoDto): Promise<{ photoUrl: string }> {
    const [, contentType, base64] = /^data:(image\/(?:png|jpeg|gif|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dto.dataUrl) ?? [];
    if (!contentType || !PHOTO_CONTENT_TYPES.includes(contentType as PhotoContentType)) {
      throw new BadRequestException('Choose a PNG, JPEG, GIF, or WebP image.');
    }

    const data = Buffer.from(base64, 'base64');
    if (!data.length || data.length > MAX_PHOTO_BYTES) {
      throw new BadRequestException('Photos must be smaller than 5 MB.');
    }
    if (data.toString('base64') !== base64) {
      throw new BadRequestException('Invalid image encoding.');
    }
    if (!PHOTO_SIGNATURES[contentType as PhotoContentType](data)) {
      throw new BadRequestException('The image contents do not match the selected file type.');
    }

    const photo = await this.photos.save(this.photos.create({
      ownerUserId: userId,
      contentType,
      data,
    }));
    return { photoUrl: `/api/photos/${photo.id}` };
  }

  async findPublic(id: string): Promise<Photo> {
    const photo = await this.photos.findOneBy({ id });
    if (!photo) throw new NotFoundException('Photo not found.');
    return photo;
  }

  async assertOwnedByUser(photoUrl: string | undefined, userId: string): Promise<void> {
    if (!photoUrl) return;
    const match = /^\/api\/photos\/([0-9a-f-]{36})$/i.exec(photoUrl);
    if (!match) throw new BadRequestException('Invalid photo URL.');
    const photo = await this.photos.findOneBy({ id: match[1], ownerUserId: userId });
    if (!photo) throw new BadRequestException('Choose a photo you uploaded.');
  }
}
