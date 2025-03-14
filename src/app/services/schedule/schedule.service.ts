// resource.service.ts (with mock resources)
/* eslint-disable @typescript-eslint/no-explicit-any */
// resource.service.ts
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { environment } from 'src/environments/environment';
import { ResourceDto } from 'src/app/models/dto/ResourceDto';
import { ReservationCreateDto } from 'src/app/models/dto/ReservationCreateDto';
import { LectureDto } from 'src/app/models/dto/LectureDto';
import { LectureCreateDto } from 'src/app/models/dto/LectureCreateDto';

export interface BackendReservationDto {
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

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  constructor(private readonly http: HttpClient) {}

  getLectures(from: DayPilot.Date, to: DayPilot.Date): Observable<LectureDto[]> {
    return this.http
      .get<LectureDto[]>(`${environment.apiUrl}/lectures?from=${from.toString()}&to=${to.toString()}`)
      .pipe(catchError(this.handleError));
  }

  createLectures(lecture: LectureCreateDto): Observable<LectureDto> {
    console.log('Creating lecture:', lecture);
    return this.http.post<LectureDto>(`${environment.apiUrl}/lectures`, lecture);
  }

  updateLecture(id: string, lecture: any): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/lectures/${id}`, lecture);
  }

  deleteLecture(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/lectures/${id}`);
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
