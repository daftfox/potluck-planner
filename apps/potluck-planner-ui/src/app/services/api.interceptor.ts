import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApiErrorService } from './api-error.service';
import { SessionService } from './session.service';

/** Adds the session bearer token to API requests and reports API failures. */
export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/')) return next(request);

  const token = inject(SessionService).token();
  const errors = inject(ApiErrorService);
  const authorised = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorised).pipe(
    catchError((error: unknown) => {
      errors.report(error);
      return throwError(() => error);
    }),
  );
};
