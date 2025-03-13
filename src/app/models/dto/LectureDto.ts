import { DateTime } from 'rrule/dist/esm/datetime';
import { RecurrencePattern } from './ReservationCreateDto';

export interface LectureDto {
  id: number;
  title: string;
  description: string;
  startTime: DateTime;
  endTime: DateTime;
  recurrencePattern: RecurrencePattern;
  courseId: number;
  lecturerId: number;
  subjectId: number;
  resources: number[];
}
