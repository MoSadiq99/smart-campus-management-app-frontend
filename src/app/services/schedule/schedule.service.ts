// resource.service.ts (with mock resources)
/* eslint-disable @typescript-eslint/no-explicit-any */
// resource.service.ts
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { environment } from 'src/environments/environment';
import { ReservationDto } from 'src/app/models/dto/ReservationDto';
import { LectureDto } from 'src/app/models/dto/LectureDto';
import { LectureCreateDto } from 'src/app/models/dto/LectureCreateDto';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  constructor(private readonly http: HttpClient) {}

  getEvents(from: DayPilot.Date, to: DayPilot.Date): Observable<ReservationDto[]> {
    return this.http
      .get<ReservationDto[]>(`${environment.apiUrl}/lectures/reservations?from=${from.toString()}&to=${to.toString()}`)
      .pipe(catchError(this.handleError));
  }

  getLectures(): Observable<LectureDto[]> {
    return this.http.get<LectureDto[]>(`${environment.apiUrl}/lectures`).pipe(catchError(this.handleError));
  }

  createLecture(lecture: LectureCreateDto): Observable<ReservationDto> {
    console.log('Creating lecture:', lecture);
    return this.http.post<ReservationDto>(`${environment.apiUrl}/lectures`, lecture);
  }

  updateReservation(id: string, reservation: any): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/resources/reservations/${id}`, reservation);
  }

  deleteLecture(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/resources/reservations/${id}`);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
