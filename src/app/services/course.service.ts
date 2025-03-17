/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CourseCreateDto, CourseDto } from 'src/app/models/course-dto';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { StudentDto } from '../models/student-dto';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private readonly http: HttpClient) {}

  public getCourses(): Observable<CourseDto[]> {
    console.log('Loading Course: GET');
    return this.http.get<CourseDto[]>(`${environment.apiUrl}/courses`);
  }

  public create(newCourse: CourseCreateDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/courses`, newCourse);
  }

  public getCourseByCode(courseCode: string): Observable<any> {
    return this.http.get<CourseDto>(`${environment.apiUrl}/courses/${courseCode}`);
  }

  public updateCourse(course: CourseDto): Observable<any> {
    return this.http.put<CourseDto>(`${environment.apiUrl}/courses/${course.courseId}`, course);
  }

  public getEnrolledStudents(courseId: number): Observable<number[]> {
    return this.http.get<number[]>(`${environment.apiUrl}/courses/${courseId}/enrolled-students`);
  }

  public getEnrolledStudentsList(courseId: number): Observable<StudentDto[]> {
    return this.http.get<StudentDto[]>(`${environment.apiUrl}/courses/${courseId}/enrolled-students-list`);
  }

  public enrollStudents(courseId: number, studentIds: number[]): Observable<any> {
    return this.http.post(`${environment.apiUrl}/courses/${courseId}/enrolled-students`, studentIds);
  }
}
