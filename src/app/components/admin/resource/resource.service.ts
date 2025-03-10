import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// Interfaces for DTOs
export interface ResourceCreateDto {
  resourceName: string;
  type: string;
  capacity?: number;
  availabilityStatus: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE'; // Matches ResourceStatus enum
  location?: string;
}

export interface ResourceDto {
  id: number;
  resourceName: string;
  type: string;
  capacity?: number;
  availabilityStatus: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE'; // Matches ResourceStatus enum
  location?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private readonly apiUrl = `${environment.apiUrl}/resources`;

  constructor(private readonly http: HttpClient) { }

  createResource(resource: ResourceCreateDto): Observable<ResourceDto> {
    return this.http.post<ResourceDto>(this.apiUrl, resource, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Get a resource by ID
  getResourceById(id: number): Observable<ResourceDto> {
    return this.http.get<ResourceDto>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Get all resources
  getAllResources(): Observable<ResourceDto[]> {
    return this.http.get<ResourceDto[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Update a resource
  updateResource(id: number, resource: ResourceCreateDto): Observable<ResourceDto> {
    return this.http.put<ResourceDto>(`${this.apiUrl}/${id}`, resource).pipe(
      catchError(this.handleError)
    );
  }

  // Delete a resource
  deleteResource(id: number): Observable<void> {
    console.log('deleteResource');
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Error handling
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
