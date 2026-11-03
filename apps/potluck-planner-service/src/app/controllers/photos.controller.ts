import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UploadPhotoDto } from '../dto/upload-photo.dto';
import { AuthenticatedUser } from '../models/authenticated-user';
import { AuthenticatedRequest } from '../services/authenticated-request';
import { JwtAuthGuard } from '../services/jwt-auth.guard';
import { PhotosService } from '../services/photos.service';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  upload(@Req() request: AuthenticatedRequest, @Body() dto: UploadPhotoDto) {
    return this.photosService.save(
      (request.user as AuthenticatedUser).id,
      dto,
    );
  }

  @Get(':id')
  @Header('Cache-Control', 'public, max-age=3600')
  async get(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() response: Response,
  ): Promise<void> {
    const photo = await this.photosService.findPublic(id);
    response.type(photo.contentType).send(photo.data);
  }
}
