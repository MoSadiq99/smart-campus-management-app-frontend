import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { StudentDto } from '../models/student-dto';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  constructor(private readonly http: HttpClient) {}

  public getStudents(): Observable<StudentDto[]> {
    return this.http.get<StudentDto[]>(`${environment.apiUrl}/students`);
  }

  // public create(newSubject: SubjectCreateDto): Observable<SubjectDto> {
  //   return this.http.post<SubjectDto>(`${environment.apiUrl}/subjects`, newSubject);
  // }

  // public getSubjectById(subjectId: string): Observable<SubjectDto> {
  //   return this.http.get<SubjectDto>(`${environment.apiUrl}/subjects/${subjectId}`);
  // }

  // public updateSubject(subject: SubjectDto): Observable<SubjectDto> {
  //   return this.http.put<SubjectDto>(`${environment.apiUrl}/subjects/${subject.subjectId}`, subject);
  // }
}
