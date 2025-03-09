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

  public getCourses(): Observable<CourseDto[]> {
    console.log("Loading Course: GET")
    return this.http.get<CourseDto[]>(`${environment.apiUrl}/courses`)
  }

  public createCourse(newCourse: CourseCreateDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/courses`, newCourse);
  }
}
