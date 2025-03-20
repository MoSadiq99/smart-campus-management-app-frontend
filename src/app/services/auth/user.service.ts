import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserDto } from 'src/app/models/dto/UserDto';
import { StudentDto } from 'src/app/models/student-dto';
import { AdminDto } from 'src/app/models/dto/AdminDto';
import { LecturerDto } from 'src/app/models/dto/LecturerDto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<UserDto[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<UserDto[]>(`${this.apiUrl}/users`, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching users:', error);
        return of([]);
      })
    );
  }

  getStudentById(userId: number): Observable<StudentDto> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<StudentDto>(`${this.apiUrl}/students/${userId}`, { headers }).pipe(
      catchError((error) => {
        console.error(`Error fetching student ${userId}:`, error);
        return of({} as StudentDto);
      })
    );
  }

  getLecturerById(userId: number): Observable<LecturerDto> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<LecturerDto>(`${this.apiUrl}/lecturers/${userId}`, { headers }).pipe(
      catchError((error) => {
        console.error(`Error fetching lecturer ${userId}:`, error);
        return of({} as LecturerDto);
      })
    );
  }

  getAdminById(userId: number): Observable<AdminDto> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<AdminDto>(`${this.apiUrl}/admins/${userId}`, { headers }).pipe(
      catchError((error) => {
        console.error(`Error fetching admin ${userId}:`, error);
        return of({} as AdminDto);
      })
    );
  }

  updateUser(user: UserDto): Observable<StudentDto> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<StudentDto>(`${this.apiUrl}/users/${user.userId}`, user, { headers }).pipe(
      catchError((error) => {
        console.error(`Error updating student ${user.userId}:`, error);
        return throwError(error);
      })
    );
  }

  getUserById(userId: number): Observable<UserDto | null> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<UserDto>(`${this.apiUrl}/users/${userId}`, { headers }).pipe(
      catchError((error) => {
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

  hasRole(roles: string[]): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map((user) => (user ? roles.includes(user.roleName) : false)),
      catchError(() => of(false))
    );
  }
}
export { UserDto };
