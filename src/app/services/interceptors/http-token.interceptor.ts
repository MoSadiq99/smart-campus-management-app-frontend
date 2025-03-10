import { HttpInterceptorFn } from '@angular/common/http';

export const httpTokenInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');
  console.log('Interceptor - URL:', req.url, 'Token:', token);

  if (req.url.includes('/api/auth/login')) {
    return next(req);
  }
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Interceptor - Added Authorization header:', `Bearer ${token}`);
    return next(req);
  }
  return next(req);
};
