import { EventStatus } from './event-enums';

export interface EventDto {
  eventId: number;
  organizerId: number;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  capacity: number;
  status: EventStatus;
  attendeeIds: number[];
}
