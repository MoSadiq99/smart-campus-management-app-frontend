import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../auth/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private readonly authService: AuthenticationService,
    private readonly router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    // _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    const expectedRoles = route.data['roles'] as string[];
    const userRole = this.authService.getCurrentUserRole();

    if (this.isAuthorized(userRole, expectedRoles)) {
      return true; // Allow access if the user has the required role(s)
    }
    this.redirectToLogin(); // Redirect if unauthorized
    return false;
  }

  private isAuthorized(userRole: string | undefined, expectedRoles: string[]): boolean {
    if (!userRole) {
      return false; // User is not logged in
    }
    return expectedRoles.includes(userRole); // Check if the user has the required role
  }

  private redirectToLogin(): void {
    this.router.navigate(['/auth/signin'], { queryParams: { returnUrl: this.router.url } });
  }
}

