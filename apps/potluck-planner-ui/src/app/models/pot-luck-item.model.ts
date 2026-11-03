import { Dish } from './dish.model';
import { PotLuckAttendee } from './pot-luck-attendee.model';
import { RsvpStatus } from './rsvp-status.model';

export interface PotLuckItem {
  id: string;
  title: string;
  date: string;
  startsOn: string;
  location: string;
  organiser: string;
  organiserUserId?: string;
  startTime: string;
  attendanceLabel: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  dishes?: Dish[];
  attendees?: PotLuckAttendee[];
  rsvpStatus?: RsvpStatus;
}
