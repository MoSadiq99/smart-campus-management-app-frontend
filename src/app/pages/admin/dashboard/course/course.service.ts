import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CourseCreateDto, CourseDto } from 'src/app/models/course-dto';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(private readonly http: HttpClient) { }

  getCourses(): Observable<CourseDto[]> {
    return this.http.get<CourseDto[]>(`${environment.apiUrl}/courses`)
  }

  // Method to get a course by ID
  // getCourseById(id: number): Observable<CourseDto | undefined> {
  //   const course = this.courses.find(course => course.id === id);
  //   return of(course);
  // }

  // // Method to create a new course
  // createCourse(course: CourseCreateDto): Observable<Course> {
  //   const newCourse = { ...course, id: this.courses.length + 1 };
  //   this.courses.push(newCourse);
  //   return of(newCourse);
  // }

  // private mapToEventData(event: EventDto): DayPilot.EventData {
  //     return {
  //       id: event.eventId,
  //       text: event.title,
  //       start: new DayPilot.Date(event.startTime),
  //       end: new DayPilot.Date(event.endTime),
  //       backColor: CalendarService.colors.green,
  //       tags: {
  //         capacity: event.capacity,
  //         location: event.location,
  //         organizerId: event.organizerId,
  //         status: event.status,
  //         attendeeIds: event.attendeeIds,
  //         description: event.description
  //       }
  //     };
}
