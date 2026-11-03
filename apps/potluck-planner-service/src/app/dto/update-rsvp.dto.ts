import { IsEnum } from 'class-validator';
import { RsvpStatus } from '../models/rsvp-status';

export class UpdateRsvpDto {
  @IsEnum(RsvpStatus)
  status!: RsvpStatus;
}
