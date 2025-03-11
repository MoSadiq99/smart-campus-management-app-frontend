import { inject } from '@angular/core';
import { TokenService } from './../token/token.service';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const tokenService: TokenService = inject(TokenService);
  const router: Router = inject(Router);

  if (tokenService.isTokenNotValid()) {
    router.navigate(['/auth/signin']);
    return false;
  }
  return true;
};
