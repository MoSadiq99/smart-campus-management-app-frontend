import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserDto } from 'src/app/models/dto/UserDto';

// export interface UserDto {
//   id: number;
//   name: string;
//   email: string;
//   role: {
//     roleName: string;
//   };
// }

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<UserDto[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<UserDto[]>(`${this.apiUrl}/users`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error fetching users:', error);
          return of([]);
        })
      );
  }

  getUserById(userId: number): Observable<UserDto | null> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<UserDto>(`${this.apiUrl}/users/${userId}`, { headers })
      .pipe(
        catchError(error => {
          console.error(`Error fetching user ${userId}:`, error);
          return of(null);
        })
      );
  }

  getCurrentUserId(): number | null {
    const userId = localStorage.getItem('userId');
    console.log('userId:', userId);
    return userId ? parseInt(userId, 10) : null;
  }

  getCurrentUser(): Observable<UserDto | null> {
    const userId = this.getCurrentUserId();
    if (!userId) return of(null);
    return this.getUserById(userId);
  }

  isAdminOrLecturer(): Observable<boolean> {
    return this.hasRole(['ROLE_ADMIN', 'ROLE_LECTURER']);
  }

  hasRole(roles: string []): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => user ? roles.includes(user.roleName) : false),
      catchError(() => of(false))
    );
  }
}
export { UserDto };

