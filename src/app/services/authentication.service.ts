import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../models/login-response';
import { UserRegisterDto } from '../models/user-register-dto';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  static readonly RegisterPath = 'http://localhost:8080/api/auth/register';

  register(user: UserRegisterDto): Observable<unknown> {
    return this.http.post(AuthenticationService.RegisterPath, user);
  }

  static readonly LoginPath = 'http://localhost:8080/api/auth/login';

  login(credentials: { email: string, password: string }): Observable<LoginResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<LoginResponse>(AuthenticationService.LoginPath, credentials, { headers }).pipe(
      tap((response) => this.handleLoginResponse(response))
    );
  }

  private handleLoginResponse(response: LoginResponse): void {
    console.log('Login response:', response); //! Debugging line

    // Set the user roles after a successful login
    this.setCurrentUserRoles(response.roles);
    // Set the user ID after a successful login
    this.setCurrentUserId(response.userId);
  }

  private currentUserRoles: string[] = [];

  getCurrentUserRoles(): string[] {
    return this.currentUserRoles;
  }

  setCurrentUserRoles(roles: string[]): void {
    this.currentUserRoles = roles;
  }

  private currentUserId: number;

  setCurrentUserId(userId: number): void {
    console.log('Setting current user ID:', userId);
    this.currentUserId = userId;
  }

  getCurrentUserId(): number {
    return this.currentUserId;
  }
}

