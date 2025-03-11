export interface RecurrencePattern {
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  interval: number;
  endDate?: string;
  daysOfWeek?: number[];
}

export interface ReservationCreateDto {

  title?: string;
  lectureId?: number;  // if the reservation is for a lecture
  eventId?: number;    // if the reservation is for an event
  resourceId: number;
  startTime: string;
  endTime: string;
  recurrence?: RecurrencePattern;
}
