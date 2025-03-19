import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { LoginResponse } from '../../models/login-response';
import { UserRegisterDto } from '../../models/user-register-dto';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenService } from '../token/token.service';

interface JwtPayload {
  id: number; // Match the "id" claim from your backend
  sub: string; // Username/email
  authorities: string[]; // Roles
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserRole: string;
  static readonly RegisterPath = 'http://localhost:8080/api/register';
  static readonly LoginPath = 'http://localhost:8080/api/authenticate';
  private readonly jwtHelper = new JwtHelperService();

  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService,

  ) {}

  register(user: UserRegisterDto): Observable<unknown> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(AuthenticationService.RegisterPath, user, { headers }).pipe(
      catchError((error) => {
        console.error('Registration failed:', error);
        return throwError(() => new Error('Registration failed'));
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<LoginResponse>(AuthenticationService.LoginPath, credentials, { headers }).pipe(
      tap((response) => {
        this.handleLoginResponse(response);
        this.saveToken(response.token);
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(() => new Error('Login failed'));
      })
    );
  }

  private saveToken(token?: string): void {
    if (token) {
      this.tokenService.token = token; // Save token to TokenService
      console.log('Token saved:', token); // Debugging
    } else {
      console.warn('No token received in login response');
    }
  }

  private handleLoginResponse(response: LoginResponse): void {
    console.log('Login response:', response); // Debugging line
    this.setCurrentUserRole(response.user.roleName);
  }

  public getCurrentUserRole(): string {
    return this.currentUserRole;
  }

  private setCurrentUserRole(role: string): void {
    this.currentUserRole = role;
  }

  getCurrentUserId(): number {
    const token = this.tokenService.token;
    if (!token) {
      console.warn('No token found in storage');
      return 0;
    }
    try {
      const decoded = this.jwtHelper.decodeToken<JwtPayload>(token);

      console.log('Decoded token:', decoded); // Debugging
      console.log('Decoded token:', decoded.id); // Debugging
      return decoded.id || 0;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return 0;
    }
  }

  // Added chat group creation logic
  getUsername(): string {
    const token = localStorage.getItem('token');
    return this.jwtHelper.decodeToken(token)?.sub || ''; // 'sub' is email
  }

  getRole(): string {
    const token = localStorage.getItem('token');
    const decodedToken = this.jwtHelper.decodeToken(token);
    // console.log('Decoded token:', decodedToken);
    return decodedToken?.authorities?.[0] || ''; // First authority is the role
  }

  isAdmin(): boolean {
    return this.getRole() === 'ROLE_ADMIN';
  }

  isLecturer(): boolean {
    return this.getRole() === 'ROLE_LECTURER';
  }

  isStudent(): boolean {
    return this.getRole() === 'ROLE_STUDENT';
  }
}
