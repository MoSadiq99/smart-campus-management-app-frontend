export interface ScheduleCreateDto {
  userId: number; // Required
  courseId?: number; // Optional
  title: string; // Required
  startTime: string; // ISO 8601 format (e.g., "2025-09-01T13:00:00")
  endTime: string; // ISO 8601 format
  recurrence?: string; // Optional
  location?: string; // Optional
  status: string; // Required
}
