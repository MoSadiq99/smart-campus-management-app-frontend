import { DateTime } from 'rrule/dist/esm/datetime';
import { RecurrencePattern } from './ReservationCreateDto';

export interface LectureCreateDto {
  title: string;
  description: string;
  startTime: DateTime;
  endTime: DateTime;
  recurrencePattern: RecurrencePattern;
  courseId: number;
  lecturerId: number;
  subjectId: number;
  resource: number;
}
