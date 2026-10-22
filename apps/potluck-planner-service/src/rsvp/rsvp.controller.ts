import { Controller, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { RsvpService } from './rsvp.service';
import { CreateOrUpdateRsvpDto } from './rsvp.dto';

@Controller('rsvps')
export class RsvpController {
  constructor(
    private readonly rsvpService: RsvpService,
    private readonly validationPipe: ValidationPipe,
  ) {}

  @Post()
  createOrUpdate(@Body(this.validationPipe) dto: CreateOrUpdateRsvpDto) {
    return this.rsvpService.createOrUpdate(dto);
  }

  @Patch(':potluckId/:userId')
  update(
    @Param('potluckId') potluckId: string,
    @Param('userId') userId: string,
    @Body(this.validationPipe) dto: Partial<CreateOrUpdateRsvpDto>,
  ) {
    return this.rsvpService.update(potluckId, userId, dto);
  }

  @Delete(':potluckId/:userId')
  remove(@Param('potluckId') potluckId: string, @Param('userId') userId: string) {
    return this.rsvpService.remove(potluckId, userId);
  }
}
