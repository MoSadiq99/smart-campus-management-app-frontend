export interface ReservationDto {
  title: string;
  reservationId: number;
  resourceId: number;
  startTime: string;
  endTime: string;
  lectureId?: number | null;
  eventId?: number | null;
  status?: string;
  // recurrence?: RecurrencePattern;
}
