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
  providedIn: 'root',
})
export class ResourceService {

  private readonly apiUrl = `${environment.apiUrl}/resources`;

  constructor(private readonly http: HttpClient) { }

  // getEvents(from: DayPilot.Date, to: DayPilot.Date): Observable<ExtendedEventData[]> {
  //   return this.http.get<ExtendedEventData[]>(`${this.apiUrl}/reservations?from=${from.toString()}&to=${to.toString()}`);
  // }

  getEvents(from: DayPilot.Date, to: DayPilot.Date): Observable<BackendReservationDto[]> {
    return this.http.get<BackendReservationDto[]>(`${this.apiUrl}/reservations?from=${from.toString()}&to=${to.toString()}`).pipe(
      catchError(this.handleError)
    );
  }

  // Get all resources
  getAllResources(): Observable<ResourceDto[]> {
    return this.http.get<ResourceDto[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  createReservation(reservation: ReservationCreateDto): Observable<any> {
    console.log('Creating reservation:', reservation);
    return this.http.post(`${this.apiUrl}/reservations`, reservation, {
      observe: 'response',
      responseType: 'json',
      params: { userId: 1 } // Replace with actual user ID
    });
  }

  updateReservation(id: string, reservation: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reservations/${id}`, reservation);
  }

  deleteReservation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reservations/${id}`);
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
