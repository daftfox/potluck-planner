import { RsvpStatus } from './rsvp-status.model';

export interface PotLuckAttendee {
  id: string;
  name: string;
  status: RsvpStatus;
}
