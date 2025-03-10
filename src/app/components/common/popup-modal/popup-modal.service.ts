import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PopupModalService {

  constructor(private readonly http: HttpClient) {}

  // public createCourse(newCourse: CourseCreateDto): Observable<any> {
  //     return this.http.post(`${environment.apiUrl}/courses`, newCourse);
  //   }
}
